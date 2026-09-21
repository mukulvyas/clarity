# Clarity — API Contract

Base URL: `/api` (FastAPI backend)

## Documents

### `POST /documents/upload`
Upload a document for processing.

**Request:** multipart/form-data — `file` (PDF/DOCX/image)

**Response (success):**
```json
{
  "document_id": "uuid",
  "status": "processing",
  "filename": "Apartment_Lease.pdf",
  "page_count": 14
}
```

**Response (low-quality scan / extraction failure):**
```json
{
  "document_id": "uuid",
  "status": "error",
  "error_type": "low_clarity",
  "legibility_score": 42,
  "message": "The capture was faint and blurred in some sections.",
  "unresolved_sections": ["Section 14.2"],
  "suggested_fixes": [
    "Use overhead, non-glare lighting",
    "Lay the document flat",
    "Upload a digital PDF instead of a photo"
  ]
}
```

### `GET /documents/:id/summary`
Returns the processed document summary.

**Response:**
```json
{
  "document_id": "uuid",
  "filename": "Apartment_Lease.pdf",
  "page_count": 14,
  "bottom_line": [
    {
      "title": "Early Termination Fee",
      "tag": "High Penalty",
      "summary": "Leaving before 12 months requires a 2 months' rent penalty ($4,200) plus forfeiture of your $2,100 deposit.",
      "clause_id": "uuid"
    }
  ],
  "clauses": [
    {
      "clause_id": "uuid",
      "section_ref": "Section 4.1",
      "title": "Rent, Due Dates & Late Grace Period",
      "plain_explanation": "You have a 5-day grace window every month before a late fee kicks in.",
      "original_text": "Late Charge: Tenant agrees to pay a $105 charge if rent payment is not received in full by Oakwood Management after 5:00 PM on the 5th day of the calendar month.",
      "page_ref": "Page 3, Line 42",
      "risk_tag": "standard"
    }
  ]
}
```

### `GET /documents/:id/clauses/:clause_id`
Returns full clause-detail data: original text, explanation, real-life
scenario, fairness-check score, suggested negotiation questions.

## Chat

### `POST /documents/:id/chat`
**Request:**
```json
{ "message": "What if my dishwasher breaks? Am I on the hook for fixing it?" }
```

**Response:**
```json
{
  "answer": "You are only responsible if the repair costs less than $75...",
  "cited_clauses": [
    {
      "clause_id": "uuid",
      "section_ref": "Section 9.3",
      "excerpt": "Lessee assumes financial responsibility for minor appliance adjustments under seventy-five dollars ($75.00)...",
      "page_ref": "Page 5"
    }
  ],
  "next_action": "File your ticket via the landlord's portal and cite Clause 9.3."
}
```

If no relevant clause is found:
```json
{
  "answer": "This document doesn't appear to address that directly.",
  "cited_clauses": [],
  "next_action": null
}
```

## Compare

### `POST /documents/compare`
**Request:**
```json
{ "document_a_id": "uuid", "document_b_id": "uuid" }
```

**Response:**
```json
{
  "verdict": "Version 2 is significantly better for you",
  "confidence": 98,
  "favorable_changes": 3,
  "unresolved_cautions": 1,
  "new_risks": 0,
  "clause_diffs": [
    {
      "section_ref": "Section 8.2",
      "title": "Pet Policy & Deposit Terms",
      "classification": "better_for_you",
      "explanation": "The landlord removed the $50/month pet rent and capped the one-time deposit at $250."
    }
  ]
}
```

## Action Plan

### `GET /documents/:id/action-plan`
**Response:**
```json
{
  "progress": { "completed": 2, "total": 5 },
  "checklist": [
    {
      "id": "uuid",
      "title": "Request amendment to Clause 18.2 (early termination fee cap)",
      "description": "The current 3-month fee penalty is above city averages.",
      "status": "pay_attention",
      "suggested_script": "Dear Oakwood Heights Management, ..."
    }
  ],
  "questions_for_landlord": [
    "Can we add an exception to the early termination fee for involuntary job relocation?"
  ],
  "resources": [
    { "name": "City Tenant Advocacy Project", "type": "free_consultation" }
  ]
}
```

### `PATCH /documents/:id/action-plan/:item_id`
Update checklist item status (e.g., mark completed).

## Conventions
- All AI-generated fields in responses are implicitly covered by the
  "AI-generated — not a substitute for legal advice" UI label; no need to
  repeat this in every payload
- All endpoints require `Authorization: Bearer <supabase_jwt>` except
  where explicitly public
- Errors follow `{ "error_type": string, "message": string }` shape
