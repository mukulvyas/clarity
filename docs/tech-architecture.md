# Clarity — Technical Architecture

## Stack

**Frontend**
- Next.js 14 (App Router), TypeScript
- Tailwind CSS + shadcn/ui components
- Deployed on Vercel

**Backend**
- FastAPI (Python), in a separate `/server` directory
- Deployed on Cloud Run or Railway

**Database / Auth / Storage**
- Supabase (Postgres, Auth, file storage, pgvector extension)

**Document Processing**
- `pdfplumber` / `PyMuPDF` for text-based PDF extraction
- `pytesseract` (Tesseract OCR) as fallback for scanned/photographed
  documents, or Google Document AI if time/quota allows
- Extraction confidence score determines whether to proceed or return the
  "low clarity" error state to the frontend

**AI / LLM**
- Gemini API (2.5/3 Flash or Pro) as primary model for clause extraction,
  plain-language rewriting, comparison, and RAG-based chat
- Claude API as an alternative/fallback for grounded explanation quality
  if time permits — both should be callable behind a single internal
  `llm_client` interface so swapping providers doesn't touch business logic

**Vector Store**
- Supabase pgvector — clause-level chunks embedded and stored per document,
  queried via cosine similarity for RAG retrieval in the chat feature

**Agent Framework**
- Google Agent Development Kit (ADK) — pairs naturally with Gemini and
  Antigravity, and is used ONLY for the cross-clause consistency check
  (see "Agentic Component" below). Everything else in the pipeline stays
  a deterministic, hardcoded flow for demo reliability.

## Data Flow

```
Upload (PDF/DOCX/image)
   │
   ▼
Text Extraction (pdfplumber / OCR fallback)
   │
   ├── low confidence → return structured error → frontend shows
   │                     "Upload Error State" screen
   │
   ▼ (high confidence)
Clause Chunking (split by section/clause boundaries)
   │
   ▼
Embedding Generation → stored in pgvector (per clause chunk)
   │
   ▼
Clause Analysis (LLM call per clause or batched):
   - plain-language explanation
   - risk tag (standard / worth-reviewing / risky)
   - category
   - exact source text + page/line reference
   │
   ▼
Bottom Line Summary Generation (top 2-4 findings across all clauses)
   │
   ▼
Stored in Postgres → served to frontend
```

**Chat (RAG) flow:**
```
User question
   │
   ▼
Embed question → similarity search against document's clause chunks
   │
   ▼
Retrieve top-k relevant chunks
   │
   ▼
LLM call: answer using ONLY retrieved context, cite the source clause
   │
   ▼ (if no relevant chunks retrieved)
Respond that the document doesn't address this, rather than guessing
```

**Compare flow:**
```
Two documents → run clause extraction on both independently
   │
   ▼
Align matching sections (by section number/topic similarity)
   │
   ▼
LLM call per aligned pair: classify as better-for-you / worse-for-you /
same, generate plain-English "what changed" explanation
   │
   ▼
Generate executive impact summary (counts + estimated impact)
```

## Agentic Component: Cross-Clause Consistency Check

This is the one deliberately agentic part of the system — everywhere else
uses a fixed pipeline (extract → embed → single LLM call → store) because
that's more reliable to demo. This step genuinely needs multi-step
reasoning: a single LLM call over one clause can't tell you that Clause
18.2 (early termination) contradicts Clause 9.3 (repair cost threshold)
elsewhere in the same document.

**Why this needs to be an agent, not a single prompt:** the model doesn't
know in advance which clauses relate to each other. It has to look at one
clause, decide "does this reference or conflict with something else in
this document," call a tool to search for related clauses, evaluate what
it finds, and decide whether to flag an inconsistency or move on. That
decide → call tool → evaluate → decide again loop is what makes it an
agent rather than a RAG lookup.

**Runs:** once per document, after Stage 3 (clause analysis) completes and
before the Bottom Line summary is generated, so any flagged
inconsistencies can be surfaced as a "Bottom Line" priority item.

**Tools available to the agent:**
1. `search_related_clauses(clause_id, query)` — vector similarity search
   within the same document's clause embeddings; returns candidate related
   clauses
2. `get_clause_detail(clause_id)` — fetches full text/metadata for a
   specific clause
3. `flag_inconsistency(clause_id_a, clause_id_b, explanation)` — records a
   finding to the `inconsistencies` table

**Loop (conceptually, implemented via Google ADK):**
```
for each clause flagged risky/worth-reviewing:
    agent reasons: "does this clause depend on or conflict with
                    obligations defined elsewhere in this document?"
    if yes →
        agent calls search_related_clauses()
        agent evaluates candidates via get_clause_detail()
        if a genuine conflict/dependency is found →
            agent calls flag_inconsistency() with plain-language explanation
    agent decides whether to continue checking or stop
```

**Guardrails (important for a legal product):**
- Cap the agent at a fixed max number of tool calls per document (e.g. 15)
  to bound cost/latency and prevent runaway loops
- The agent may only flag inconsistencies grounded in text it retrieved via
  its tools — it must cite both clause IDs it compared, same grounding
  rule as the rest of the product
- If the agent finds nothing, that's a valid and expected outcome — do not
  pressure it to always produce a finding

**MCP note:** if time permits, `search_related_clauses` and
`get_clause_detail` can be exposed as an MCP server so the agent's tool
use is inspectable/swappable — this is a good technical talking point for
judges, but the hardcoded ADK function-calling version below is enough
for the hackathon deadline. Don't build MCP wrapping unless the core loop
is already working end-to-end.

## Database Schema (Supabase / Postgres)

- `documents` — id, user_id, filename, upload_date, page_count, status
  (processing/ready/error), extraction_confidence
- `clauses` — id, document_id, section_ref, title, original_text,
  page_ref, plain_explanation, risk_tag, category, embedding (vector)
- `chat_messages` — id, document_id, role (user/assistant), content,
  cited_clause_ids (array), created_at
- `action_items` — id, document_id, title, description, status
  (pending/completed), suggested_script (nullable)
- `comparisons` — id, document_a_id, document_b_id, summary_json,
  created_at
- `inconsistencies` — id, document_id, clause_id_a, clause_id_b,
  explanation, created_at

## Environment Variables

See `.env.example` — never commit real keys. Backend reads keys via
environment variables only; frontend never holds LLM API keys directly
(all LLM calls proxied through the FastAPI backend).

## Build Staging (see master prompt for full detail)

1. Scaffold monorepo + Supabase schema + basic upload
2. Document processing pipeline (extraction + OCR fallback + error state)
3. Clause analysis (core AI feature)
4. Cross-clause consistency agent (ADK) — the agentic component
5. RAG chat
6. Compare + Action Plan endpoints
7. Frontend screens matching `/docs/design-reference.md`

Each stage should be run and visually/functionally verified before moving
to the next.
