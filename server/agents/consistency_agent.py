"""
Cross-Clause Consistency Agent
--------------------------------
The one deliberately agentic component of Clarity. Runs once per document
after clause analysis (Stage 3) completes, before the Bottom Line summary
is generated.
"""
import logging
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from server.db import get_supabase
from server.embeddings import embed_text, cosine_search

logger = logging.getLogger(__name__)

MAX_TOOL_CALLS_PER_RUN = 15

# ---------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------

def search_related_clauses(document_id: str, clause_id: str, query: str) -> dict:
    """Search for clauses in the same document that may relate to or
    conflict with a given clause.

    Args:
        document_id: The document being analyzed.
        clause_id: The clause currently under review (excluded from results).
        query: A short description of what kind of related obligation or
            condition to search for, e.g. "repair cost responsibility" or
            "early termination conditions".

    Returns:
        A dict with a "candidates" list of up to 5 clauses, each containing
        clause_id, section_ref, title, and a short excerpt.
    """
    try:
        query_embedding = embed_text(query)
        results = cosine_search(
            document_id=document_id,
            embedding=query_embedding,
            exclude_clause_id=clause_id,
            top_k=5,
        )
        return {
            "candidates": [
                {
                    "clause_id": r["clause_id"],
                    "section_ref": r["section_ref"],
                    "title": r["title"],
                    "excerpt": r["original_text"][:300],
                }
                for r in results
            ]
        }
    except Exception as e:
        logger.error("search_related_clauses failed: %s", e)
        return {"error": str(e)}


def get_clause_detail(clause_id: str) -> dict:
    """Fetch the full text and metadata for a specific clause by ID.

    Args:
        clause_id: The clause to retrieve.

    Returns:
        A dict with section_ref, title, original_text, page_ref, and
        risk_tag for the clause. Returns an error dict if not found.
    """
    supabase = get_supabase()
    row = (
        supabase.table("clauses")
        .select("id, section_ref, title, original_text, page_ref, risk_tag")
        .eq("id", clause_id)
        .single()
        .execute()
    )
    if not row.data:
        return {"error": f"No clause found with id {clause_id}"}
    return row.data


def flag_inconsistency(
    document_id: str, clause_id_a: str, clause_id_b: str, explanation: str
) -> dict:
    """Record a genuine, citable inconsistency or dependency conflict
    between two clauses in the same document. Only call this when you have
    concrete textual evidence from both clauses — never speculate.

    Args:
        document_id: The document these clauses belong to.
        clause_id_a: The first clause in the conflict.
        clause_id_b: The second clause in the conflict.
        explanation: A plain-language explanation of the conflict, written
            for a non-lawyer, citing what each clause actually says.

    Returns:
        A dict confirming the finding was recorded, with its new id.
    """
    supabase = get_supabase()
    row = (
        supabase.table("inconsistencies")
        .insert(
            {
                "document_id": document_id,
                "clause_id_a": clause_id_a,
                "clause_id_b": clause_id_b,
                "explanation": explanation,
            }
        )
        .execute()
    )
    return {"recorded": True, "inconsistency_id": row.data[0]["id"]}


# ---------------------------------------------------------------------
# Agent definition
# ---------------------------------------------------------------------

consistency_agent = Agent(
    name="clause_consistency_checker",
    model="gemini-3.6-flash",
    instruction="""
You are reviewing a legal document, one flagged clause at a time, to find
genuine inconsistencies or dependency conflicts with other clauses
elsewhere in the same document.

For the clause you are given:
1. Decide whether it depends on, references, or could conflict with an
   obligation defined elsewhere in the document (e.g. a termination
   clause that references repair costs, or a deposit clause that
   references damage definitions set elsewhere).
2. If it might, call search_related_clauses with a short, specific query
   describing the kind of related obligation you're looking for.
3. For any promising candidate, call get_clause_detail to read its full
   text before concluding anything — never flag based on the short
   excerpt alone.
4. Only call flag_inconsistency if you find a genuine, textually-grounded
   conflict or dependency worth surfacing to the user — not a stylistic
   similarity or a benign cross-reference. It is correct and expected to
   find nothing for most clauses.
5. Write explanations in plain language a non-lawyer can understand,
   quoting or closely paraphrasing what each clause actually says.

Be conservative. A false positive (flagging something that isn't really
a conflict) is worse than missing a subtle one, because it erodes trust
in the whole product. When unsure, do not flag it.
""",
    tools=[search_related_clauses, get_clause_detail, flag_inconsistency],
)


# ---------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------

async def run_consistency_check(document_id: str) -> list[dict]:
    """Runs the cross-clause consistency agent over all risky/
    worth-reviewing clauses in a document. Call this after clause
    analysis (Stage 3) completes and before generating the Bottom Line
    summary.

    Returns the list of inconsistencies found.
    """
    supabase = get_supabase()
    logger.info("Running consistency check for %s", document_id)
    
    clauses = (
        supabase.table("clauses")
        .select("id, section_ref, title, original_text, risk_tag")
        .eq("document_id", document_id)
        .in_("risk_tag", ["risky", "worth_reviewing"])
        .execute()
        .data
    )
    
    if not clauses:
        logger.info("No risky clauses found to check for %s", document_id)
        return []

    session_service = InMemorySessionService()
    runner = Runner(
        agent=consistency_agent,
        app_name="clarity",
        session_service=session_service,
    )

    tool_call_budget = MAX_TOOL_CALLS_PER_RUN

    for clause in clauses:
        if tool_call_budget <= 0:
            logger.warning("Consistency agent ran out of tool call budget.")
            break

        session = await session_service.create_session(
            app_name="clarity", user_id="system", session_id=f"{document_id}-{clause['id']}"
        )

        prompt = (
            f"Document: {document_id}\n"
            f"Clause under review: {clause['id']} "
            f"({clause['section_ref']} — {clause['title']})\n"
            f"Text: {clause['original_text']}\n\n"
            f"Review this clause for dependencies or conflicts with other "
            f"clauses in document {document_id}, following your instructions."
        )

        try:
            async for event in runner.run_async(
                user_id="system", session_id=session.id, new_message=prompt
            ):
                if getattr(event, "tool_call", None):
                    tool_call_budget -= 1
                if tool_call_budget <= 0:
                    break
        except Exception as e:
            logger.error("Error during consistency agent run for clause %s: %s", clause["id"], e)

    result = (
        supabase.table("inconsistencies")
        .select("*")
        .eq("document_id", document_id)
        .execute()
    )
    logger.info("Consistency check for %s complete. Found %d inconsistencies.", document_id, len(result.data or []))
    return result.data or []
