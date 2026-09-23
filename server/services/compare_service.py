"""
Compare service — Stage 6.
"""
import json
import logging
from typing import Any

from server.db import get_supabase
from server.llm_client import generate

logger = logging.getLogger(__name__)

COMPARE_PROMPT = """
You are an expert legal assistant comparing two versions of a contract.
You are provided with a list of clauses from Document A (older) and Document B (newer).

Your task is to identify key differences and classify them from the perspective of the user receiving the contract.

Output a strictly valid JSON object matching this schema exactly:
{
  "verdict": "A one sentence summary of which version is better for the user.",
  "confidence": 95,
  "favorable_changes": 2,
  "unresolved_cautions": 1,
  "new_risks": 0,
  "clause_diffs": [
    {
      "section_ref": "Section 14.1",
      "title": "Pet Policy",
      "classification": "better_for_you", // must be "better_for_you", "worse_for_you", or "neutral"
      "explanation": "The landlord removed the ₹2,000/month pet fee."
    }
  ]
}

DO NOT include markdown code blocks like ```json ... ```. Output raw JSON only.
"""

async def run_comparison(document_a_id: str, document_b_id: str) -> dict[str, Any]:
    """
    Fetches clauses for both documents, runs Gemini to compare, and persists to DB.
    """
    logger.info("Comparing docs %s and %s", document_a_id, document_b_id)
    supabase = get_supabase()
    
    # Fetch clauses for A
    clauses_a = (
        supabase.table("clauses")
        .select("section_ref, title, original_text")
        .eq("document_id", document_a_id)
        .execute()
    ).data or []
    
    # Fetch clauses for B
    clauses_b = (
        supabase.table("clauses")
        .select("section_ref, title, original_text")
        .eq("document_id", document_b_id)
        .execute()
    ).data or []
    
    prompt = f"--- DOCUMENT A (Older) ---\n"
    for c in clauses_a:
        prompt += f"[{c.get('section_ref')} - {c.get('title')}] {c.get('original_text')}\n\n"
        
    prompt += f"\n--- DOCUMENT B (Newer) ---\n"
    for c in clauses_b:
        prompt += f"[{c.get('section_ref')} - {c.get('title')}] {c.get('original_text')}\n\n"
        
    # Ask LLM
    try:
        response_text = await generate(
            prompt=prompt,
            system_prompt=COMPARE_PROMPT,
            model_name="gemini-3.6-flash",
            temperature=0.2
        )
        
        # Clean markdown
        clean_json = response_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        result = json.loads(clean_json.strip())
        
        return result
        
    except Exception as e:
        logger.error("Failed to generate comparison via LLM: %s", e)
        return {
            "verdict": "Unable to compare these documents.",
            "confidence": 0,
            "favorable_changes": 0,
            "unresolved_cautions": 0,
            "new_risks": 0,
            "clause_diffs": [],
        }
