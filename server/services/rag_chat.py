"""
RAG Chat Service — Grounded LLM Q&A with Guardrails & Multi-Turn Support.
Translates complex contract clauses into plain English using Google Gemini.
"""
import json
import logging
import re
from typing import Any, Optional

from server.embeddings import embed_text, cosine_search
from server.llm_client import generate
from server.db import get_supabase

logger = logging.getLogger(__name__)

RAG_PROMPT = """
You are Clarity AI, an empathetic, highly intelligent legal companion helping a user navigate and understand a specific legal document.

Document Context:
{context_text}

{conversation_history_text}

Instructions:
1. GREETINGS & CONVERSATIONAL QUESTIONS:
   If the user offers a greeting or asks how you are (e.g. "hi", "hello", "how are you", "who are you", "what can you do"):
   - Respond warmly and naturally as Clarity AI, powered by Google Gemini.
   - Mention that you have analyzed their document and are ready to translate complex legal terms into plain, reassuring English.
   - Do NOT cite clauses for general greetings or chitchat. Return `"cited_clauses": []`.
   - In `"next_action"`, suggest 2-3 specific questions they could ask about their agreement (e.g., penalties, grace periods, repair duties).

2. DOCUMENT OVERVIEW & SUMMARY REQUESTS:
   If the user asks for an overview or summary of the agreement (e.g., "tell me about all the doc", "summarize this contract", "what is this agreement about?", "what are the main points?"):
   - Provide a well-structured, easy-to-read executive summary highlighting the key provisions across the agreement.
   - Format each key area as a numbered item with a bold title (e.g., 1. **Rent & Payment Terms:**, 2. **Renewal & Notice:**, 3. **Maintenance Responsibilities:**, 4. **Early Termination & Penalties:**).
   - Ensure every numbered point starts on a NEW line with double line breaks (\\n\\n).
   - Cite all relevant clauses provided in the context that support the summary points.

3. SPECIFIC CONTRACT QUESTIONS & FOLLOW-UPS:
   If the user asks about specific terms (or asks follow-up questions referencing previous messages):
   - Answer in clear, plain, reassuring human English using the document context.
   - Use the conversation history to understand context, pronouns ("it", "they", "that fee"), and prior topics.
   - Every grounded answer MUST cite the specific clause(s) used from the context.
   - Accurately copy `clause_id`, `section_ref`, `excerpt` (short verbatim quote under 30 words), and `page_ref`.

4. OUT-OF-SCOPE / OFF-TOPIC QUESTIONS:
   If the question is completely unrelated to legal contracts or this document (e.g., cooking recipes, weather, coding bots):
   - Politely explain that you are Clarity AI, focused exclusively on helping them navigate their legal agreements.
   - Return `"cited_clauses": []`.

5. FORMATTING & SCHEMA:
   Return ONLY a valid JSON object matching this schema:
   {{
     "answer": "Plain-English answer with markdown bolding (**Key Term**) and double line breaks between numbered points.",
     "cited_clauses": [
       {{
         "clause_id": "exact-clause-id-from-context",
         "section_ref": "Section X.Y",
         "excerpt": "Short verbatim quote from clause (max 30 words)",
         "page_ref": "Page Z"
       }}
     ],
     "next_action": "Helpful suggested next step for the user, or null if not needed."
   }}
"""

DEMO_LEASE_CLAUSES = [
    {
        "clause_id": "clause-4-1-rent",
        "section_ref": "Section 4.1",
        "title": "Monthly Rent, Due Dates & Grace Period",
        "page_ref": "Page 3, Line 42",
        "original_text": "Monthly Rent is ₹35,000.00 due on or before the 1st day of each English calendar month. Late Payment Fee: Tenant agrees to pay a late fee of ₹1,500.00 if the monthly rent is not received in full by Palm Grove Management by 5:00 PM on the 5th day of the month."
    },
    {
        "clause_id": "clause-6-1-renewal",
        "section_ref": "Section 6.1",
        "title": "11-Month Term & Notice Period",
        "page_ref": "Page 4, Line 22",
        "original_text": "This Agreement shall be in force for an initial lock-in period of eleven (11) months. Either party may terminate by providing not less than two (2) months prior written notice. Rent will escalate by 10% upon execution of any renewal agreement."
    },
    {
        "clause_id": "clause-9-3-repairs",
        "section_ref": "Section 9.3",
        "title": "Maintenance Threshold & Repairs",
        "page_ref": "Page 6, Line 08",
        "original_text": "Tenant agrees to maintain premises in clean condition and pay for routine minor repairs costing under ₹1,500.00. Landlord covers major structural, plumbing mains, and electrical line repairs."
    },
    {
        "clause_id": "clause-18-2-termination",
        "section_ref": "Section 18.2",
        "title": "Lock-in Period & Early Termination Penalty",
        "page_ref": "Page 9, Line 14",
        "original_text": "In the event Tenant vacates or terminates prior to completion of the 11-month lock-in period, Tenant shall forfeit the full security deposit (₹1,05,000.00, equivalent to 3 months rent) and remain liable for an Early Termination Penalty equal to two (2) months rent (₹70,000.00)."
    }
]

DEMO_FREELANCE_CLAUSES = [
    {
        "clause_id": "clause-1-1-scope",
        "section_ref": "Section 1.1",
        "title": "Scope of Work & Milestone Deliverables",
        "page_ref": "Page 1, Line 12",
        "original_text": "Contractor agrees to deliver UI/UX wireframes and final design Figma assets for the web application according to the milestone schedule in Statement of Work Annexure A."
    },
    {
        "clause_id": "clause-3-2-payment",
        "section_ref": "Section 3.2",
        "title": "Payment Terms, TDS & GST",
        "page_ref": "Page 2, Line 18",
        "original_text": "Total project fee is ₹1,50,000.00 payable in milestones. Client shall pay invoices within thirty (30) days of receipt (Net 30) via NEFT/RTGS. Payments are subject to applicable TDS under Section 194J of the Income Tax Act, 1961, and 18% GST where registered."
    },
    {
        "clause_id": "clause-5-1-ip",
        "section_ref": "Section 5.1",
        "title": "Intellectual Property & Work Product Ownership",
        "page_ref": "Page 3, Line 05",
        "original_text": "Upon full and final payment of the total agreed fee (₹1,50,000.00), Contractor assigns to Client all worldwide copyright, title, and ownership in the final deliverable designs."
    },
    {
        "clause_id": "clause-8-3-termination",
        "section_ref": "Section 8.3",
        "title": "Termination for Convenience & Jurisdiction",
        "page_ref": "Page 5, Line 22",
        "original_text": "Either party may terminate this Agreement without cause upon fourteen (14) days prior written notice. This Agreement is governed by the laws of India, with exclusive jurisdiction in the courts of New Delhi/Bengaluru."
    }
]

DEMO_TECH_OFFER_CLAUSES = [
    {
        "clause_id": "clause-1-2-salary",
        "section_ref": "Section 1.2",
        "title": "Annual CTC & Joining Bonus",
        "page_ref": "Page 2, Line 04",
        "original_text": "Total Cost to Company (CTC) shall be ₹24,00,000.00 per annum (₹2,00,000.00 per month gross). A one-time joining bonus of ₹2,00,000.00 is subject to 100% recovery if Employee resigns within twelve (12) months."
    },
    {
        "clause_id": "clause-2-1-noncompete",
        "section_ref": "Section 2.1",
        "title": "Non-Competition & Section 27 Indian Contract Act",
        "page_ref": "Page 3, Line 14",
        "original_text": "Employee agrees that during employment, Employee shall not directly or indirectly engage in competitive business activities. Post-termination restrictions are subject to Section 27 of the Indian Contract Act, 1872."
    },
    {
        "clause_id": "clause-4-2-equity",
        "section_ref": "Section 4.2",
        "title": "ESOP Allocation & 1-Year Cliff",
        "page_ref": "Page 5, Line 08",
        "original_text": "Employee Stock Options (ESOPs) shall vest over a 4-year schedule: twenty-five percent (25%) upon completion of twelve (12) months of continuous service (1-year cliff), and 1/48th per month thereafter."
    },
    {
        "clause_id": "clause-7-1-ip",
        "section_ref": "Section 7.1",
        "title": "Inventions Assignment & IP Ownership",
        "page_ref": "Page 7, Line 22",
        "original_text": "All inventions, software code, algorithms, and technical documentation developed by Employee during employment belong exclusively to the Company."
    }
]


# --- GUARDRAIL 1: Input Scope Check (Strictly off-topic only) ---
OFF_TOPIC_PATTERNS = [
    r"\b(cook|recipe|bake|cake|pasta|pizza)\b",
    r"\b(weather|temperature|forecast)\b",
    r"\b(write a python|write javascript|code a bot|c\+\+|java code)\b",
    r"\b(who won|game score|nfl|nba|football match)\b",
]

def _check_off_topic_guardrail(question: str) -> Optional[dict[str, Any]]:
    """Intercept purely off-topic queries (recipes, weather, sports)."""
    q_lower = question.lower().strip()
    for pat in OFF_TOPIC_PATTERNS:
        if re.search(pat, q_lower):
            return {
                "answer": "I am Clarity AI, your personal legal companion. My role is to analyze and explain legal agreements, leases, and contracts. I can't help with general web tasks, recipes, or coding, but I'd be happy to answer any questions about your agreement!",
                "cited_clauses": [],
                "next_action": "Ask a question about your contract, such as early termination penalties, payment terms, or repair duties."
            }
    return None


def _is_overview_query(question: str) -> bool:
    """Checks if the user is asking for a summary/overview of the whole document."""
    q_lower = question.lower().strip()
    overview_triggers = [
        "all the doc", "all document", "all clauses", "whole doc", "entire doc",
        "summarize", "summary", "overview", "what is this agreement",
        "what is this contract", "what does this document say", "explain the document",
        "tell me about the document", "tell me about this doc", "what are the terms",
        "what am i agreeing to", "key points", "main points"
    ]
    return any(trig in q_lower for trig in overview_triggers)


# --- GUARDRAIL 2: Anti-Hallucination Citation Verification ---
def _apply_citation_guardrail(result: dict[str, Any], context_clauses: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Verifies that all cited clauses returned by the LLM exist in the provided context clauses.
    Filters out invalid or hallucinated clause citations.
    """
    valid_ids = {c["clause_id"] for c in context_clauses if "clause_id" in c}
    valid_clauses = []

    for citation in result.get("cited_clauses", []):
        cid = citation.get("clause_id")
        if cid in valid_ids:
            valid_clauses.append(citation)
        else:
            sec_ref = citation.get("section_ref", "").lower()
            matched = next((c for c in context_clauses if c.get("section_ref", "").lower() == sec_ref), None)
            if matched:
                citation["clause_id"] = matched["clause_id"]
                valid_clauses.append(citation)
            else:
                logger.warning(f"[GUARDRAIL] Filtered hallucinated citation ID: {cid}")

    result["cited_clauses"] = valid_clauses
    return result


# --- GUARDRAIL 3: Safety & Non-Attorney Disclaimer Check ---
def _apply_safety_guardrail(result: dict[str, Any]) -> dict[str, Any]:
    """Ensures response does not claim to be licensed legal counsel."""
    answer = result.get("answer", "")
    prohibited_phrases = ["I am your attorney", "I am a licensed lawyer", "As your legal counsel"]
    for phrase in prohibited_phrases:
        if phrase.lower() in answer.lower():
            answer = re.sub(phrase, "I am Clarity AI, your educational legal companion", answer, flags=re.IGNORECASE)
    result["answer"] = answer
    return result


async def _resolve_document_clauses(document_id: str, question: str) -> list[dict[str, Any]]:
    """
    Resolves document clauses using Supabase vector search, database clause lookup, or demo fallbacks.
    For overview queries, returns all major clauses in the document.
    """
    # 1. Demo document IDs
    if document_id in ("freelance-design-contract", "freelance-contract"):
        return DEMO_FREELANCE_CLAUSES
    if document_id in ("tech-corp-offer", "employment-offer"):
        return DEMO_TECH_OFFER_CLAUSES
    if document_id in ("oakwood-lease-4b", "demo", "mock-doc-123"):
        return DEMO_LEASE_CLAUSES

    clauses = []
    is_overview = _is_overview_query(question)

    # 2. For overview queries, fetch all clauses directly from DB for complete context
    if is_overview:
        try:
            supabase = get_supabase()
            res = supabase.table("clauses").select("*").eq("document_id", document_id).limit(10).execute()
            if res.data:
                for c in res.data:
                    clauses.append({
                        "clause_id": c["id"],
                        "section_ref": c.get("section_ref", "Section"),
                        "title": c.get("title", "Clause"),
                        "page_ref": c.get("page_ref", "Page 1"),
                        "original_text": c.get("original_text", c.get("plain_explanation", ""))
                    })
                return clauses
        except Exception as e:
            logger.warning(f"Failed to fetch overview clauses from DB: {e}")

    # 3. For specific queries, use vector search
    try:
        query_embedding = embed_text(question)
        results = cosine_search(document_id=document_id, embedding=query_embedding, top_k=5)
        for r in results:
            clauses.append({
                "clause_id": r.get("clause_id", f"clause-{len(clauses)+1}"),
                "section_ref": r.get("section_ref", "Section Reference"),
                "title": r.get("title", "Contract Clause"),
                "page_ref": r.get("page_ref", "Page 1"),
                "original_text": r.get("original_text", r.get("chunk_text", ""))
            })
    except Exception as e:
        logger.warning(f"Vector retrieval failed for doc {document_id}: {e}")

    # 4. If vector search returned nothing, query clauses table directly
    if not clauses:
        try:
            supabase = get_supabase()
            res = supabase.table("clauses").select("*").eq("document_id", document_id).limit(8).execute()
            if res.data:
                for c in res.data:
                    clauses.append({
                        "clause_id": c["id"],
                        "section_ref": c.get("section_ref", "Section"),
                        "title": c.get("title", "Clause"),
                        "page_ref": c.get("page_ref", "Page 1"),
                        "original_text": c.get("original_text", c.get("plain_explanation", ""))
                    })
        except Exception as e:
            logger.warning(f"Database clause query failed for doc {document_id}: {e}")

    # 5. Final fallback to lease demo clauses if still empty
    if not clauses:
        clauses = DEMO_LEASE_CLAUSES

    return clauses


def _format_conversation_history(history: Optional[list[dict[str, Any]]]) -> str:
    """Formats recent conversation history for prompt injection."""
    if not history:
        return ""
    
    formatted_turns = []
    # Keep last 6 messages
    for msg in history[-6:]:
        role = "User" if msg.get("role") == "user" else "Assistant"
        content = msg.get("content", "").strip()
        if content:
            formatted_turns.append(f"{role}: {content}")
    
    if not formatted_turns:
        return ""
    
    return "Recent Conversation History:\n" + "\n".join(formatted_turns) + "\n"


async def answer_question(
    document_id: str,
    question: str,
    history: Optional[list[dict[str, Any]]] = None
) -> dict[str, Any]:
    """
    RAG Chat Engine:
    1. Evaluates Off-Topic Guardrail
    2. Resolves document context (overview vs. semantic chunks)
    3. Prompts Gemini LLM with context & multi-turn history
    4. Applies Anti-Hallucination & Safety Guardrails
    """
    logger.info(f"RAG chat processing question for doc '{document_id}': {question}")

    # Step 1: Off-Topic Guardrail
    guardrail_response = _check_off_topic_guardrail(question)
    if guardrail_response:
        logger.info(f"Off-topic guardrail triggered for query: {question}")
        return guardrail_response

    # Step 2: Resolve Context Clauses
    context_clauses = await _resolve_document_clauses(document_id, question)

    context_blocks = []
    for r in context_clauses:
        context_blocks.append(
            f"--- CLAUSE ID: {r['clause_id']} ---\n"
            f"Section: {r.get('section_ref', 'N/A')}\n"
            f"Title: {r.get('title', 'N/A')}\n"
            f"Page: {r.get('page_ref', 'N/A')}\n"
            f"Text: {r.get('original_text', '')}\n"
        )
    context_text = "\n".join(context_blocks)
    conversation_history_text = _format_conversation_history(history)

    system_instruction = RAG_PROMPT.format(
        context_text=context_text,
        conversation_history_text=conversation_history_text
    )
    user_prompt = f"User Question: {question}"

    # Step 3: Call Gemini LLM
    try:
        response_text = await generate(
            prompt=user_prompt,
            system_prompt=system_instruction,
            model_name="gemini-3.6-flash",
            temperature=0.2
        )

        clean_json = response_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        # Extract JSON substring if surrounding commentary was generated
        json_match = re.search(r'(\{[\s\S]*\})', clean_json)
        if json_match:
            clean_json = json_match.group(1)

        try:
            result = json.loads(clean_json, strict=False)
        except Exception:
            sanitized = re.sub(r'(?<!\\)\n', r'\\n', clean_json)
            result = json.loads(sanitized, strict=False)

        if "answer" not in result:
            result = _fallback_llm_response(question, context_clauses)

        if "cited_clauses" not in result or not isinstance(result["cited_clauses"], list):
            result["cited_clauses"] = []

        # Step 4: Apply Output Guardrails
        result = _apply_citation_guardrail(result, context_clauses)
        result = _apply_safety_guardrail(result)

        return result

    except Exception as e:
        logger.error(f"Gemini LLM generation exception: {e}", exc_info=True)
        fallback = _fallback_llm_response(question, context_clauses)
        return _apply_safety_guardrail(fallback)


def _fallback_llm_response(question: str, context_clauses: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Context-aware fallback if LLM call fails.
    Never dumps a single random clause. Provides a structured overview or honest guidance.
    """
    is_overview = _is_overview_query(question)
    if is_overview and context_clauses:
        points = []
        cited = []
        for i, c in enumerate(context_clauses[:5], 1):
            sec = c.get("section_ref", f"Section {i}")
            title = c.get("title", "Key Provision")
            text = c.get("original_text", "")
            points.append(f"{i}. **{sec} ({title}):** {text}")
            cited.append({
                "clause_id": c["clause_id"],
                "section_ref": sec,
                "excerpt": text[:100],
                "page_ref": c.get("page_ref", "Page 1")
            })
        return {
            "answer": "Here is an overview of the key clauses and terms in your agreement:\n\n" + "\n\n".join(points),
            "cited_clauses": cited,
            "next_action": "Ask a question about any specific clause or obligation."
        }

    # Search context clauses for keyword match
    q_words = [w for w in question.lower().split() if len(w) > 3]
    for clause in context_clauses:
        text = (clause.get("original_text", "") + " " + clause.get("title", "")).lower()
        if any(w in text for w in q_words):
            return {
                "answer": f"According to {clause.get('section_ref', 'the agreement')}: {clause.get('original_text', '')}",
                "cited_clauses": [{
                    "clause_id": clause["clause_id"],
                    "section_ref": clause.get("section_ref", "Section"),
                    "excerpt": clause.get("original_text", "")[:100],
                    "page_ref": clause.get("page_ref", "Page 1")
                }],
                "next_action": "Review this section of your contract for full details."
            }

    # Honest, helpful fallback instead of random clause dump
    return {
        "answer": "I couldn't locate a specific clause directly addressing your question in the available sections. You can ask me about payment obligations, early termination penalties, maintenance responsibilities, or renewal notices.",
        "cited_clauses": [],
        "next_action": "Try asking: 'What happens if I terminate early?' or 'What are the rent payment terms?'"
    }
