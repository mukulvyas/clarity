"""
Compare router — POST /documents/compare
"""
import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from server.db import get_supabase
from server.dependencies import get_current_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["compare"])


class CompareRequest(BaseModel):
    document_a_id: str
    document_b_id: str


@router.post("/compare")
async def compare_documents(body: CompareRequest, user_id: str = Depends(get_current_user)):
    """
    Compare two already-processed documents clause by clause.
    Returns executive impact summary + clause_diffs array.
    """
    supabase = get_supabase()

    for doc_id in (body.document_a_id, body.document_b_id):
        doc = (
            supabase.table("documents")
            .select("id, status")
            .eq("id", doc_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")
        if doc.data["status"] != "ready":
            raise HTTPException(
                status_code=422, detail=f"Document {doc_id} is not yet ready."
            )

    from server.services.compare_service import run_comparison

    result = await run_comparison(
        document_a_id=body.document_a_id,
        document_b_id=body.document_b_id,
    )

    # Persist comparison
    supabase.table("comparisons").insert({
        "document_a_id": body.document_a_id,
        "document_b_id": body.document_b_id,
        "summary_json": result,
    }).execute()

    return result
