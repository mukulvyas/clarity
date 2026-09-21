# Clarity — Product Requirements Document

## Problem Statement (Hackathon Brief)

**Theme: AI for Legal Assistance & Access**

Legal information is often complex, difficult to understand, and challenging
to navigate without professional assistance. Build a GenAI-powered solution
that makes legal information and basic legal assistance more accessible by
helping users understand, compare, and navigate legal documents and
information.

Potential use cases include:
- Simplifying complex legal documents
- Comparing contracts, agreements, or policies
- Highlighting important clauses, obligations, risks, or inconsistencies
- Answering questions based on provided legal documents
- Helping users understand their options and potential next steps
- Generating summaries, checklists, or other actionable outputs
- Helping users prepare information or questions for a legal professional

**Constraint:** The solution must provide information and assistance,
rather than replace professional legal advice. This must be reflected in
the UX, not just a disclaimer buried in a footer.

## Product: Clarity — Personal Legal Companion

Clarity is a calm, human-friendly AI assistant that helps everyday people
(renters, freelancers, employees — not lawyers) understand contracts and
agreements before they sign them.

### Design Principle
This is explicitly NOT a legal-ops dashboard or enterprise tool. It should
feel like a knowledgeable, reassuring friend reading the document with you —
warm color palette, plain language, no dense data tables, no
command-center aesthetic. Every AI-generated claim must be traceable to an
exact clause in the source document (grounded, cited, never hallucinated).

### Core User
A non-lawyer facing a document they're anxious about — a lease, freelance
contract, insurance policy, or job offer — who wants to understand what
they're agreeing to and what to watch out for, without paying for a lawyer
just to get oriented.

### Screens & Core Features

1. **Home / Upload**
   - Upload a document (PDF, DOCX, image/scan) or use phone camera
   - Three quick-start pathways: Simplify a Document, Compare Two Documents,
     Ask a Question
   - Recent documents list with at-a-glance risk status
   - Requires user authentication; all data is private per-user

2. **My Documents (History/List View)**
   - Shows all documents the current user has uploaded
   - Each entry shows filename, upload date, page count, and status summary
   - Clicking a document opens its Document Summary
   - Empty state encourages uploading the first document

3. **Document Summary (My Documents detail view)**
   - "30-Second Bottom Line" — top 2-4 highest-priority findings, shown by
     default with an option to expand to all highlights
   - Plain-language clause-by-clause breakdown, each clause showing:
     - Section reference and plain-English header
     - "What this means" explanation
     - Original contract text with exact page/line citation
     - Risk tag: Standard / Worth Reviewing / Risky

3. **Clause Detail View**
   - Deep dive on a single flagged clause
   - Original wording, plain-language explanation, a concrete real-life
     scenario, a "fairness check" comparing the clause to typical/standard
     terms, and ready-to-use negotiation questions

4. **Compare Two Documents**
   - Upload two versions (e.g., original vs. revised contract)
   - Executive impact summary: favorable changes / unresolved cautions /
     new risks introduced
   - Clause-by-clause diff in plain language, tagged better-for-you /
     worse-for-you / same

5. **Ask Clarity (Chat)**
   - Document picker view when no document is active
   - Chat grounded in the uploaded document only
   - Every answer must cite the specific clause/section it's based on
   - Suggested questions based on the document's flagged clauses

6. **Action Plan**
   - Document picker view when no document is active
   - Personalized pre-signing checklist derived from flagged risks
   - Ready-to-send email/question scripts for the other party
   - Free/low-cost legal aid resources for high-risk situations

7. **Upload Error State**
   - Friendly handling of low-quality scans / unsupported files
   - Explains what went wrong in plain language, offers concrete fixes,
     never presents a raw technical error

### Non-Negotiable UX Rules
- Every AI-generated explanation must be labeled "AI-generated — not a
  substitute for legal advice," visible near the content but not repeated
  so often it reads as nagging (once per screen is enough)
- No fabricated user counts, testimonials, or stats — trust signals must be
  real (encryption, citation grounding, cost) not invented social proof
- No named "human reviewer" personas implying real lawyer review of a
  specific document — attribute AI output to the AI, clearly

### Core Features & Architecture Additions
- **Authentication**: Users must log in via email/password to access the app (using Supabase Auth).
- **Data Privacy**: All documents, clauses, chat messages, and action plans are scoped exclusively to the authenticated user.

### Out of Scope (for hackathon MVP)
- E-signature / contract execution
- Jurisdiction-specific legal accuracy guarantees
- Real attorney marketplace/booking (link out to legal aid resources only)
