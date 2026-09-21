"""
Documents router — handles upload, status polling, and summary retrieval.

POST /documents/upload       — upload a PDF/DOCX/image for processing
GET  /documents/{id}         — get document status
GET  /documents/{id}/summary — get processed summary with clauses
GET  /documents/{id}/clauses/{clause_id} — get full clause detail
"""
import logging
import mimetypes
import uuid
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile, status, Depends
from pydantic import BaseModel

from server.config import get_settings
from server.db import get_supabase
from server.services.storage import upload_to_storage
from server.dependencies import get_current_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])

# Allowed file types
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".tiff"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/tiff",
}


class UploadResponse(BaseModel):
    document_id: str
    status: str
    filename: str
    page_count: Optional[int] = None


class UploadErrorResponse(BaseModel):
    document_id: str
    status: str  # "error"
    error_type: str  # "low_clarity"
    legibility_score: float
    message: str
    unresolved_sections: list[str]
    suggested_fixes: list[str]


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """
    Upload a PDF, DOCX, or image for analysis.

    Returns immediately with document_id and status="processing".
    Background task runs the full pipeline:
      1. Store in Supabase storage
      2. Extract text (pdfplumber → OCR fallback)
      3. Check confidence → error state if below threshold
      4. Chunk → embed → analyze clauses → consistency check → bottom line
    """
    settings = get_settings()

    # --- Validate file ---
    filename = file.filename or "upload"
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {size_mb:.1f}MB exceeds the {settings.max_upload_size_mb}MB limit.",
        )

    content_type = file.content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"

    # --- Create document record ---
    document_id = str(uuid.uuid4())
    supabase = get_supabase()

    try:
        supabase.table("documents").insert({
            "id": document_id,
            "user_id": user_id,
            "filename": filename,
            "status": "processing",
        }).execute()
    except Exception as e:
        logger.error("Failed to create document record: %s", e)
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # --- Upload to storage ---
    try:
        storage_path = upload_to_storage(
            file_bytes=file_bytes,
            filename=filename,
            document_id=document_id,
            content_type=content_type,
        )
        # Update storage_path on the document record
        supabase.table("documents").update({
            "storage_path": storage_path
        }).eq("id", document_id).execute()
    except RuntimeError as e:
        # Mark document as error and propagate
        supabase.table("documents").update({"status": "error"}).eq("id", document_id).execute()
        raise HTTPException(status_code=500, detail=str(e))

    # --- Kick off background processing pipeline ---
    background_tasks.add_task(
        _run_processing_pipeline,
        document_id=document_id,
        file_bytes=file_bytes,
        filename=filename,
    )

    return UploadResponse(
        document_id=document_id,
        status="processing",
        filename=filename,
    )


@router.get("")
async def list_documents(user_id: str = Depends(get_current_user)):
    """
    List all documents belonging strictly to the authenticated user.
    Enforces multi-tenant data isolation.
    """
    supabase = get_supabase()
    result = (
        supabase.table("documents")
        .select("id, filename, upload_date, page_count, status, extraction_confidence, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/{document_id}")
async def get_document_status(document_id: str, user_id: str = Depends(get_current_user)):
    """Poll document processing status."""
    supabase = get_supabase()
    result = (
        supabase.table("documents")
        .select("id, filename, status, page_count, extraction_confidence, created_at")
        .eq("id", document_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc_data = result.data
    settings = get_settings()
    
    # If the document is in error state due to low extraction confidence
    if doc_data.get("status") == "error" and doc_data.get("extraction_confidence") is not None:
        if doc_data["extraction_confidence"] < settings.ocr_confidence_threshold:
            return {
                "document_id": doc_data["id"],
                "status": "error",
                "error_type": "low_clarity",
                "legibility_score": doc_data["extraction_confidence"],
                "message": "The capture was faint and blurred or lacks extractable text.",
                "unresolved_sections": ["Unable to determine sections"],
                "suggested_fixes": [
                    "Use overhead, non-glare lighting",
                    "Lay the document flat",
                    "Upload a digital PDF instead of a photo or scan"
                ]
            }
            
    # For success or processing, return the standard status response
    return {
        "document_id": doc_data["id"],
        "status": doc_data["status"],
        "filename": doc_data["filename"],
        "page_count": doc_data.get("page_count"),
        "extraction_confidence": doc_data.get("extraction_confidence")
    }


@router.get("/{document_id}/summary")
async def get_document_summary(document_id: str, user_id: str = Depends(get_current_user)):
    """
    Returns the processed document summary with bottom_line and clauses array.
    Matches the API contract shape exactly.
    """
    supabase = get_supabase()

    doc = (
        supabase.table("documents")
        .select("id, filename, page_count, status")
        .eq("id", document_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.data["status"] == "processing":
        raise HTTPException(status_code=202, detail="Document is still processing.")
    if doc.data["status"] == "error":
        raise HTTPException(status_code=422, detail="Document processing failed.")

    clauses_result = (
        supabase.table("clauses")
        .select(
            "id, section_ref, title, plain_explanation, original_text, page_ref, risk_tag, category"
        )
        .eq("document_id", document_id)
        .execute()
    )
    clauses = clauses_result.data or []

    # Fetch bottom line items (risky/worth_reviewing, ordered by priority)
    bottom_line_clauses = [
        {
            "title": c["title"],
            "tag": _risk_tag_to_display(c["risk_tag"]),
            "summary": c["plain_explanation"],
            "clause_id": c["id"],
        }
        for c in clauses
        if c.get("risk_tag") in ("risky", "worth_reviewing")
    ][:4]  # Top 4 max

    # Also pull any inconsistency findings as bottom-line items
    inconsistencies = (
        supabase.table("inconsistencies")
        .select("id, clause_id_a, clause_id_b, explanation")
        .eq("document_id", document_id)
        .execute()
        .data or []
    )
    for inc in inconsistencies:
        if len(bottom_line_clauses) < 4:
            bottom_line_clauses.append({
                "title": "Internal Conflict Detected",
                "tag": "Inconsistency",
                "summary": inc["explanation"],
                "clause_id": inc["clause_id_a"],
            })

    return {
        "document_id": document_id,
        "filename": doc.data["filename"],
        "page_count": doc.data["page_count"],
        "bottom_line": bottom_line_clauses,
        "clauses": [
            {
                "clause_id": c["id"],
                "section_ref": c.get("section_ref"),
                "title": c.get("title"),
                "plain_explanation": c.get("plain_explanation"),
                "original_text": c.get("original_text"),
                "page_ref": c.get("page_ref"),
                "risk_tag": c.get("risk_tag"),
            }
            for c in clauses
        ],
    }


@router.get("/{document_id}/clauses/{clause_id}")
async def get_clause_detail(document_id: str, clause_id: str, user_id: str = Depends(get_current_user)):
    """
    Full clause detail: original text, explanation, fairness score,
    scenario, negotiation questions. Populated by Stage 3 clause analysis.
    """
    # Verify document ownership first
    supabase = get_supabase()
    doc = supabase.table("documents").select("id").eq("id", document_id).eq("user_id", user_id).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    result = (
        supabase.table("clauses")
        .select("*")
        .eq("id", clause_id)
        .eq("document_id", document_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Clause not found.")
    return result.data


def _risk_tag_to_display(risk_tag: Optional[str]) -> str:
    mapping = {
        "risky": "High Penalty",
        "worth_reviewing": "Action Required",
        "standard": "Standard",
    }
    return mapping.get(risk_tag or "standard", "Standard")


async def _run_processing_pipeline(
    document_id: str,
    file_bytes: bytes,
    filename: str,
) -> None:
    """
    Full async background pipeline. Imported lazily to avoid circular imports
    at module load time. Each stage updates document status on failure.
    """
    supabase = get_supabase()
    try:
        # Stage 2: Extract text
        from server.services.extraction import extract_text_with_confidence
        extraction = await extract_text_with_confidence(file_bytes, filename)

        settings = get_settings()
        if extraction["confidence"] < settings.ocr_confidence_threshold:
            # Return structured low-clarity error (API contract shape)
            supabase.table("documents").update({
                "status": "error",
                "extraction_confidence": extraction["confidence"],
            }).eq("id", document_id).execute()
            logger.warning(
                "Document %s failed confidence check: %.1f < %.1f",
                document_id, extraction["confidence"], settings.ocr_confidence_threshold
            )
            return

        page_count = extraction.get("page_count", 1)
        supabase.table("documents").update({
            "extraction_confidence": extraction["confidence"],
            "page_count": page_count,
        }).eq("id", document_id).execute()

        # Stage 2: Chunk text
        from server.services.chunker import chunk_text
        chunks = chunk_text(extraction["text"], filename)

        # Stage 2+3: Embed + store chunks, then analyze clauses
        from server.services.clause_analyzer import analyze_and_store_clauses
        await analyze_and_store_clauses(document_id, chunks)

        # Stage 4: Cross-clause consistency check
        from server.agents.consistency_agent import run_consistency_check
        await run_consistency_check(document_id)

        # Mark ready
        supabase.table("documents").update({"status": "ready"}).eq("id", document_id).execute()
        logger.info("Document %s processing complete.", document_id)

    except Exception as e:
        logger.exception("Processing pipeline failed for document %s: %s", document_id, e)
        supabase.table("documents").update({"status": "error"}).eq("id", document_id).execute()
