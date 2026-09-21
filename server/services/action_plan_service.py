"""
Action plan service — Stage 6.
"""
import json
import logging

from server.db import get_supabase
from server.llm_client import generate

logger = logging.getLogger(__name__)

ACTION_PLAN_PROMPT = """
You are a legal advocate helping a user prepare to negotiate a contract.
You are given a list of risky clauses and inconsistencies found in their document.

For each issue, generate a practical, actionable checklist item.
If appropriate, include a short "suggested_script" the user could use in an email or conversation to address the issue.

Output a strictly valid JSON object matching this schema exactly:
{
  "items": [
    {
      "title": "A short, actionable title (e.g., 'Request early termination fee cap')",
      "description": "Why this matters and what to ask for.",
      "status": "pay_attention", // use "pay_attention" or "clarification"
      "suggested_script": "A short 1-2 sentence script to use, or null if not applicable."
    }
  ]
}

DO NOT include markdown code blocks like ```json ... ```. Output raw JSON only.
"""

async def generate_action_plan(document_id: str) -> list[dict]:
    """
    Generates action items based on risky clauses and inconsistencies,
    persists them to the database, and returns the list.
    """
    logger.info("Generating action plan for doc %s", document_id)
    supabase = get_supabase()
    
    # Fetch risky clauses
    clauses = (
        supabase.table("clauses")
        .select("section_ref, title, plain_explanation, risk_tag")
        .eq("document_id", document_id)
        .in_("risk_tag", ["risky", "worth_reviewing"])
        .execute()
    ).data or []
    
    # Fetch inconsistencies
    inconsistencies = (
        supabase.table("inconsistencies")
        .select("explanation")
        .eq("document_id", document_id)
        .execute()
    ).data or []
    
    if not clauses and not inconsistencies:
        # Nothing to act on
        item = {
            "document_id": document_id,
            "title": "Review Document",
            "description": "No major red flags or inconsistencies were found. Give the document a final read-through before signing.",
            "status": "looks_standard",
            "suggested_script": None
        }
        res = supabase.table("action_items").insert(item).execute()
        return res.data or []
        
    prompt = "--- Risky Clauses ---\n"
    for c in clauses:
        prompt += f"[{c.get('risk_tag')}] {c.get('section_ref')} - {c.get('title')}: {c.get('plain_explanation')}\n"
        
    prompt += "\n--- Inconsistencies ---\n"
    for inc in inconsistencies:
        prompt += f"- {inc.get('explanation')}\n"
        
    try:
        response_text = await generate(
            prompt=prompt,
            system_prompt=ACTION_PLAN_PROMPT,
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
            
        result = json.loads(clean_json.strip())
        items_data = result.get("items", [])
        
        # Prepare for DB insertion
        db_items = []
        for item in items_data:
            db_items.append({
                "document_id": document_id,
                "title": item.get("title", "Review Issue"),
                "description": item.get("description", ""),
                "status": item.get("status", "pay_attention"),
                "suggested_script": item.get("suggested_script")
            })
            
        if db_items:
            res = supabase.table("action_items").insert(db_items).execute()
            return res.data or []
        return []
        
    except Exception as e:
        logger.error("Failed to generate action plan via LLM: %s", e)
        # Fallback generic item
        item = {
            "document_id": document_id,
            "title": "Review Document Carefully",
            "description": "We found some risky clauses or inconsistencies, but couldn't generate a detailed plan. Please review the summary manually.",
            "status": "pay_attention",
            "suggested_script": None
        }
        res = supabase.table("action_items").insert(item).execute()
        return res.data or []
