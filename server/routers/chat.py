"""
Chat router — RAG-grounded Q&A over a document.
POST /documents/{document_id}/chat
"""
import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from typing import Optional, Any
from server.db import get_supabase
from server.dependencies import get_optional_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["chat"])


class ChatMessageItem(BaseModel):
    role: str
    content: str
    cited_clauses: Optional[list[Any]] = None


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessageItem]] = None


@router.post("/{document_id}/chat")
async def chat(document_id: str, body: ChatRequest, user_id: Optional[str] = Depends(get_optional_user)):
    """
    RAG-grounded chat with multi-turn history.
    Embeds the question, retrieves the most relevant clause chunks,
    then asks Gemini to answer using context, conversation history, and guardrails.
    Enforces user isolation so users can only chat with their own documents.
    """
    is_demo = document_id in ("freelance-design-contract", "oakwood-lease-4b", "demo", "mock-doc-123", "tech-corp-offer")
    supabase = get_supabase()
    
    if not is_demo:
        if not user_id or user_id == "demo-user":
            raise HTTPException(status_code=401, detail="Authentication required to access this document.")
        doc = (
            supabase.table("documents")
            .select("id, status")
            .eq("id", document_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found.")
        if doc.data.get("status") == "processing":
            raise HTTPException(status_code=202, detail="Document is still processing.")

    from server.services.rag_chat import answer_question

    history_dicts = []
    if body.history:
        history_dicts = [{"role": m.role, "content": m.content} for m in body.history]
    elif not is_demo and user_id and user_id != "demo-user":
        try:
            prev = (
                supabase.table("chat_messages")
                .select("role, content")
                .eq("document_id", document_id)
                .order("created_at", desc=False)
                .limit(6)
                .execute()
            )
            if prev.data:
                history_dicts = prev.data
        except Exception:
            pass

    response = await answer_question(
        document_id=document_id,
        question=body.message,
        history=history_dicts
    )

    # Persist the exchange if authenticated and real doc
    if user_id and user_id != "demo-user" and not is_demo:
        try:
            supabase.table("chat_messages").insert([
                {"document_id": document_id, "role": "user", "content": body.message},
                {
                    "document_id": document_id,
                    "role": "assistant",
                    "content": response["answer"],
                    "cited_clause_ids": [c["clause_id"] for c in response.get("cited_clauses", []) if "clause_id" in c],
                },
            ]).execute()
        except Exception as e:
            logger.warning("Failed to persist chat message: %s", e)

    return response


@router.get("/{document_id}/chat")
async def get_chat_history(document_id: str, user_id: Optional[str] = Depends(get_optional_user)):
    """
    Retrieve persisted chat history for a document.
    Enforces user isolation so only the document owner can access the conversation history.
    """
    is_demo = document_id in ("freelance-design-contract", "oakwood-lease-4b", "demo", "mock-doc-123")
    supabase = get_supabase()

    if not is_demo:
        if not user_id or user_id == "demo-user":
            return {"document_id": document_id, "messages": []}
        doc = (
            supabase.table("documents")
            .select("id")
            .eq("id", document_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found.")

    res = (
        supabase.table("chat_messages")
        .select("id, role, content, cited_clause_ids, created_at")
        .eq("document_id", document_id)
        .order("created_at", desc=False)
        .execute()
    )
    raw_messages = res.data or []

    # Collect cited clause ids to hydrate references
    all_clause_ids = set()
    for m in raw_messages:
        if m.get("cited_clause_ids"):
            all_clause_ids.update(m["cited_clause_ids"])

    clause_map = {}
    if all_clause_ids:
        try:
            clauses_res = (
                supabase.table("clauses")
                .select("id, section_ref, original_text, plain_explanation, page_ref")
                .in_("id", list(all_clause_ids))
                .execute()
            )
            for c in (clauses_res.data or []):
                clause_map[c["id"]] = {
                    "clause_id": c["id"],
                    "section_ref": c.get("section_ref") or "Section",
                    "excerpt": c.get("original_text") or c.get("plain_explanation") or "",
                    "page_ref": c.get("page_ref") or "",
                }
        except Exception as e:
            logger.warning("Error fetching cited clause metadata: %s", e)

    formatted = []
    for m in raw_messages:
        cited = []
        if m.get("cited_clause_ids"):
            for cid in m["cited_clause_ids"]:
                if cid in clause_map:
                    cited.append(clause_map[cid])
                else:
                    cited.append({"clause_id": str(cid), "section_ref": "Clause", "excerpt": "", "page_ref": ""})
        formatted.append({
            "id": m["id"],
            "role": m["role"],
            "content": m["content"],
            "cited_clauses": cited,
            "created_at": m.get("created_at"),
        })

    return {"document_id": document_id, "messages": formatted}


@router.delete("/{document_id}/chat")
async def clear_chat_history(document_id: str, user_id: Optional[str] = Depends(get_optional_user)):
    """
    Clear all chat history for a document.
    """
    is_demo = document_id in ("freelance-design-contract", "oakwood-lease-4b", "demo", "mock-doc-123")
    supabase = get_supabase()

    if not is_demo:
        if not user_id or user_id == "demo-user":
            raise HTTPException(status_code=401, detail="Authentication required.")
        doc = (
            supabase.table("documents")
            .select("id")
            .eq("id", document_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found.")

    supabase.table("chat_messages").delete().eq("document_id", document_id).execute()
    return {"status": "cleared", "document_id": document_id}
