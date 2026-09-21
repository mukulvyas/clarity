"""
Clause analyzer — Stage 3.
Calls Gemini for each chunk: plain-language explanation, risk_tag, category, etc.
Also embeds each chunk and stores in clauses table.
"""
import json
import logging
import uuid
import asyncio

from server.db import get_supabase
from server.embeddings import embed_text
from server.llm_client import generate
from server.config import get_settings

logger = logging.getLogger(__name__)

# Prompt for Gemini to analyze a single legal clause
CLAUSE_ANALYSIS_PROMPT = """
You are a top-tier legal AI assistant designed to translate complex contracts into plain English.
Analyze the provided legal clause and output a strictly valid JSON object.

Extract and evaluate the following:
1. `plain_explanation`: A clear, simple explanation of what this clause means in human terms (max 2 sentences).
2. `risk_tag`: Must be one of ["standard", "worth_reviewing", "risky"].
   - "standard": Normal boilerplate, no unusual burden.
   - "worth_reviewing": Imposes some burden or specific action on the user (e.g., notice periods, standard fees).
   - "risky": Highly unusual, aggressive penalty, one-sided liability, or hidden gotcha.
3. `category`: A short label (e.g., "Termination", "Payment", "Liability", "Pets", "Repairs").
4. `scenario`: A practical "real life" example of how this clause would apply (1 sentence).
5. `fairness_score`: Integer 0 to 100. 100 is perfectly fair to both sides, 0 is extremely abusive/one-sided against the user.
6. `negotiation_questions`: A list of 1-3 questions the user could ask the counterparty to negotiate or clarify this term. (Array of strings).

IMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks like ```json ... ```. 
Do not include any other text.
"""

async def _analyze_chunk_with_retry(chunk_text: str) -> dict:
    """Helper to analyze a single chunk using Gemini."""
    prompt = f"Clause text:\n{chunk_text}"
    try:
        response_text = await generate(
            prompt=prompt,
            system_prompt=CLAUSE_ANALYSIS_PROMPT,
            model_name="gemini-3.6-flash",
            temperature=0.2
        )
        # Strip potential markdown formatting that models sometimes add despite instructions
        clean_json = response_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        result = json.loads(clean_json.strip())
        
        # Ensure risk_tag is valid
        if result.get("risk_tag") not in ["standard", "worth_reviewing", "risky"]:
            result["risk_tag"] = "standard"
            
        return result
    except Exception as e:
        logger.error("Failed to analyze chunk via LLM: %s", e)
        # Fallback values
        return {
            "plain_explanation": "Unable to analyze this clause.",
            "risk_tag": "standard",
            "category": "General",
            "scenario": "",
            "fairness_score": 50,
            "negotiation_questions": []
        }

async def analyze_and_store_clauses(
    document_id: str,
    chunks: list[dict],
) -> list[dict]:
    """
    For each chunk:
      1. Generate embedding (Stage 2)
      2. Call Gemini for explanation, risk_tag, category (Stage 3)
      3. Insert into clauses table
    """
    supabase = get_supabase()
    stored_clauses = []
    
    # Process sequentially or in small batches to avoid rate limits
    for chunk in chunks:
        clause_id = str(uuid.uuid4())
        chunk_text = chunk.get("text", "")
        
        # 1. Embedding
        embedding = None
        if chunk_text.strip():
            try:
                # Assuming embed_text is synchronous. If it was async, we'd await it.
                # In embeddings.py it's a normal def (sync) using sync genai client
                embedding = embed_text(chunk_text)
            except Exception as e:
                logger.error("Failed to embed chunk %s: %s", clause_id, e)

        # 2. LLM Analysis
        analysis = {}
        if len(chunk_text.strip()) > 10:
            analysis = await _analyze_chunk_with_retry(chunk_text)
        else:
            analysis = {
                "plain_explanation": "Too short to analyze.",
                "risk_tag": "standard",
                "category": "General",
                "scenario": "",
                "fairness_score": 50,
                "negotiation_questions": []
            }

        # 3. Store
        clause_data = {
            "id": clause_id,
            "document_id": document_id,
            "section_ref": chunk.get("section_ref"),
            "title": chunk.get("title") or analysis.get("category", "General"),
            "original_text": chunk_text,
            "page_ref": chunk.get("page_ref"),
            "plain_explanation": analysis.get("plain_explanation"),
            "risk_tag": analysis.get("risk_tag"),
            "category": analysis.get("category"),
            "embedding": embedding,
            
            # Additional Stage 3 fields (requires migration 002)
            "scenario": analysis.get("scenario"),
            "fairness_score": analysis.get("fairness_score"),
            "negotiation_questions": analysis.get("negotiation_questions", [])
        }

        try:
            result = supabase.table("clauses").insert(clause_data).execute()
            if result.data:
                stored_clauses.append(result.data[0])
        except Exception as e:
            logger.error("Failed to store clause %s: %s", clause_id, e)

    logger.info(
        "analyze_and_store_clauses: stored %d clauses for document %s",
        len(stored_clauses), document_id
    )
    return stored_clauses
