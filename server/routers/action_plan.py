"""
Action Plan router
GET   /documents/{document_id}/action-plan
PATCH /documents/{document_id}/action-plan/{item_id}
"""
import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from server.db import get_supabase
from server.dependencies import get_current_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["action-plan"])


class UpdateStatusRequest(BaseModel):
    status: str  # "pending" | "completed" | "pay_attention" | "clarification" | "looks_standard"


@router.get("/{document_id}/action-plan")
async def get_action_plan(document_id: str, user_id: str = Depends(get_current_user)):
    """
    Returns the personalized pre-signing checklist, questions for the
    other party, and legal aid resources.
    """
    supabase = get_supabase()

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
    if doc.data["status"] != "ready":
        raise HTTPException(status_code=202, detail="Document is still processing.")

    # Check if action items already generated
    items = (
        supabase.table("action_items")
        .select("*")
        .eq("document_id", document_id)
        .execute()
        .data or []
    )

    if not items:
        # Generate on first request
        from server.services.action_plan_service import generate_action_plan
        items = await generate_action_plan(document_id)

    completed = sum(1 for i in items if i["status"] == "completed")

    return {
        "progress": {"completed": completed, "total": len(items)},
        "checklist": [
            {
                "id": item["id"],
                "title": item["title"],
                "description": item["description"],
                "status": item["status"],
                "suggested_script": item.get("suggested_script"),
            }
            for item in items
        ],
        "questions_for_landlord": _extract_questions(items),
        "resources": _legal_aid_resources(),
    }


@router.patch("/{document_id}/action-plan/{item_id}")
async def update_action_item(
    document_id: str, item_id: str, body: UpdateStatusRequest, user_id: str = Depends(get_current_user)
):
    """Update checklist item status (e.g., mark completed)."""
    valid_statuses = {"pending", "completed", "pay_attention", "clarification", "looks_standard"}
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{body.status}'. Must be one of: {valid_statuses}",
        )

    supabase = get_supabase()
    
    # Verify ownership
    doc = supabase.table("documents").select("id").eq("id", document_id).eq("user_id", user_id).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    result = (
        supabase.table("action_items")
        .update({"status": body.status, "updated_at": "now()"})
        .eq("id", item_id)
        .eq("document_id", document_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Action item not found.")
    return result.data[0]


def _extract_questions(items: list[dict]) -> list[str]:
    """Extract suggested questions from action item scripts."""
    questions = []
    for item in items:
        script = item.get("suggested_script", "")
        if script and "?" in script:
            # Pull the first sentence containing a question mark
            for sentence in script.split("."):
                if "?" in sentence:
                    questions.append(sentence.strip())
                    break
    return questions[:5]  # Cap at 5


def _legal_aid_resources() -> list[dict]:
    """Static legal aid resources (not AI-generated)."""
    return [
        {
            "name": "LawHelp.org",
            "type": "free_information",
            "url": "https://www.lawhelp.org",
        },
        {
            "name": "Legal Services Corporation",
            "type": "free_consultation",
            "url": "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help",
        },
        {
            "name": "Nolo — Tenant Rights Guide",
            "type": "self_help_guide",
            "url": "https://www.nolo.com/legal-encyclopedia/tenant-rights",
        },
    ]
