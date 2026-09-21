# Clarity — Personal Legal Companion

GenAI-powered legal document assistant built for the "AI for Legal
Assistance & Access" hackathon track.

## Project Structure

```
/docs
  PRD.md                 — product requirements, screens, non-negotiables
  design-reference.md    — visual system, components, tone (from Stitch)
  tech-architecture.md   — stack, data flow, agentic component, schema
  api-contract.md        — backend endpoint contracts
/design
  stitch-exports/        — HTML/Tailwind exports from Google Stitch (add these)
/server
  agents/
    consistency_agent.py — ADK cross-clause consistency agent
.env.example
```

## Before Opening Antigravity

1. Export your Stitch screens (Home/Upload, My Documents, Clause Detail,
   Compare, Ask Clarity, Action Plan, Upload Error State) as HTML/Tailwind
   into `/design/stitch-exports/`.
2. Copy `.env.example` to `.env` and fill in real keys (Supabase, Gemini,
   optionally Anthropic).
3. `pip install google-adk` will be needed once Stage 3.5 is reached.

## Build Order (paste into Antigravity's Editor-view agent)

Use the staged master prompt (Stages 1 → 7, see tech-architecture.md for
the authoritative list). Confirm each stage runs and is visually/
functionally verified via Antigravity's browser tool before moving on:

1. Scaffold monorepo + Supabase schema + basic upload
2. Document processing pipeline (extraction + OCR fallback + error state)
3. Clause analysis (core AI feature)
4. **Cross-clause consistency agent (agentic component)** — implement
   using `server/agents/consistency_agent.py` as the starting point
5. RAG chat
6. Compare + Action Plan endpoints
7. Frontend screens matching `/docs/design-reference.md`

## Testing the Agentic Component

Before the demo, seed one test document with a deliberately planted
contradiction so you have a guaranteed, verifiable moment to show judges
— don't rely on discovering one live. Example:

- One clause states the landlord covers all repair costs
- Another clause elsewhere states the tenant is responsible for repairs
  under a dollar threshold

Run `run_consistency_check(document_id)` against this seed document and
confirm an entry appears in the `inconsistencies` table with a clear,
plain-language explanation citing both clauses before considering Stage 4
complete.

## Demo Narrative (for the pitch)

Most of Clarity is a reliable, grounded RAG pipeline — every explanation
is cited to an exact clause and page reference, nothing is invented. The
one place a genuine agent is used is where the task actually requires
multi-step reasoning: catching contradictions between clauses that live
pages apart in the same document, which a single LLM call over one clause
can't do. That combination — reliable grounding everywhere, agentic
reasoning only where it's genuinely needed — is the technical story.
