# Product Requirements Document (PRD): Clarity AI

**Product Name:** Clarity  
**Document Type:** Product Requirements Document (PRD) & Product Brief  
**Version:** 1.2  
**Target Audience:** Everyday consumers, renters, freelancers, and small business owners navigating complex contracts  
**Status:** In Progress / Design Complete  

---

## 1. Executive Summary & Vision

### 1.1 The Problem
Legal documents (residential leases, employment agreements, freelance MSAs, insurance policies) are written in archaic, defensive legalese designed to protect drafting parties. Everyday people face an extreme **asymmetry of legal literacy**:
- **Fear & Paralysis:** Signing without reading due to cognitive overload and intimidation.
- **Hidden Financial & Legal Risks:** Uncapped indemnities, automatic renewal traps, illegal fee structures, and forfeiture waivers go unnoticed.
- **Cost Barrier:** Retaining an attorney for routine consumer paperwork ($250–$500/hour) is economically out of reach for most people.

### 1.2 The Solution
**Clarity** is an AI-powered legal document companion built to make legal comprehension accessible, calm, and actionable. Clarity translates complex contracts into human, plain-language insights with 100% grounded citations, realistic scenarios, negotiation scripts, and structured checklists.

### 1.3 Core Product Philosophy: "Headspace Meets Notion"
- **Calm over Command:** Not a legal ops dashboard, SOC console, or adversarial court tool. Clarity reduces anxiety through soft, warm palettes (linen cream, muted sage, amber highlights) and empathetic typography.
- **Radical Grounding & Zero Hallucination:** Clarity never guesses unreadable clauses or offers unsourced advice. Every single takeaway is tethered to verifiable clause excerpts.
- **Ethical & Transparent Guardrails:** No fake human legal credentials (e.g. "Elena Rostova, J.D."), no unsubstantiated marketing metrics, and clear, persistent disclaimers clarifying educational assistance vs. licensed legal counsel.

---

## 2. Target Personas & Use Cases

### Persona A: The Everyday Renter ("Maya", 27)
- **Context:** Signing a 14-page apartment lease with an institutional landlord.
- **Pain Points:** Worried about security deposit deductions, utility charges, early termination penalties, and sudden pet rent hikes.
- **Clarity Value:** Summarizes the bottom line in 30 seconds, flags excessive termination penalties, and provides a polite email script to negotiate fair terms.

### Persona B: The Independent Freelancer ("Julian", 34)
- **Context:** Reviewing a Master Services Agreement (MSA) provided by an enterprise client.
- **Pain Points:** Unclear copyright transfer, unreciprocal liability clauses, and 90-day delayed payment terms.
- **Clarity Value:** Compares the revised client draft against standard benchmarks, flags intellectual property traps, and generates a pre-signing checklist.

---

## 3. Information Architecture & Screen Flow

```
[ Home & Document Intake ]
       │
       ├───> [ Upload Scan / Ingestion Review (Error State if unreadable) ]
       │
       ├───> [ Simplified Document View (Executive Summary & Clause Breakdown) ]
       │            │
       │            ├───> [ Clause Detail & Plain-Language Explanation Panel ]
       │
       ├───> [ Compare Two Documents (Visual Diff & Impact Summary) ]
       │
       ├───> [ Ask Clarity Q&A (Document-Grounded Chat & Citations) ]
       │
       └───> [ Action Plan & Pre-Signing Checklist (Scripts & Legal Aid Directory) ]
```

---

## 4. Feature Specifications & Requirements

### 4.1 Home & Ingestion Flow
- **Warm Greeting & Clean Entry:** High-empathy welcome header with accessible text scaler controls (`A- / A / A+`) and "Read Aloud" auditory access.
- **Multi-Modal Intake:** Drag-and-drop document upload (PDF, DOCX, scans) + mobile camera roll snapshot intake.
- **Security & Ephemeral Processing:** Explicit reassurance indicators: *"Private & Encrypted"*, *"Zero Data Retention"*, and *"Never trained on public models"*.
- **Honest Trust Strip:** Minimalist credibility badges replacing vanity metrics.
- **Quick Pathways & Recents:** Instant routing to Simplify, Compare, or Q&A, with previous document cards displaying status chips (*3 clauses need attention*, *Looks standard & fair*).

### 4.2 Ingestion Diagnostics & Error State ("Upload Assistance")
- **Human-Centric Failure Handling:** If a file is blurry, cropped, or low-contrast, avoid cold technical error codes.
- **Transparent Diagnostic Rationale:** Explains that legal clauses dictate real-world liabilities, so Clarity refuses to hallucinate faint text.
- **Actionable Guidance:** 3 visual tips (overhead lighting, smoothing creases, requesting digital PDF) + dual primary recovery actions (*Take a Clearer Photo*, *Upload PDF/Word*).

### 4.3 Simplified Document View
- **"The 30-Second Bottom Line":** High-priority executive cards surfacing immediate financial impacts (Rent & Deposit, Termination Penalty, Automatic Renewal) with progressive disclosure ("Show all highlights").
- **Reflowed Clause Hierarchy:** Replaces confusing section names with human-readable headers (e.g. "Rent, Due Dates & Late Grace Period").
- **Calibrated Risk Highlighting:**
  - *Standard / Fair* (Soft Sage `#3E6B56`)
  - *Pay Attention / Potential Overcharge* (Soft Amber `#D9822B`)
  - *High Financial Risk / Double Recovery* (Soft Terracotta `#C05646`)
- **Single Chat Entry:** Streamlined navigation avoiding floating intrusive overlays.

### 4.4 Deep-Dive Clause Detail Panel
- **Side-by-Side Legalese vs. Human Translation:** Direct visual pairing of verbatim original contract clauses with digestible breakdowns.
- **Real-Life Impact Scenario:** Concrete story demonstrating what occurs in edge cases (e.g., job relocation at month 6 incurring a $6,300 bill).
- **Statutory Fairness Check:** Educational metric showing regional tenant protection standards and statutory duty-to-mitigate requirements.
- **Negotiation Toolkit:** One-click copyable scripts designed for respectful landlord communication.
- **Verified Human Aid Escalation:** Direct link to local legal aid foundations and tenant advocacy clinics for high-risk clauses.

### 4.5 Comparative Analysis Engine ("Compare Two Documents")
- **Friendly Non-Diff UI:** Replaces developer-centric raw diffs with executive card comparisons.
- **Outcome Assessment:** High-level status bar (*"Version 2 is significantly better for you — 3 substantial concessions won"*).
- **At-a-Glance Concession Metrics:** Track favorable changes, unchanged caution items, and newly introduced risks.
- **Granular Clause Redlines:** Plain-English changelog showing what was struck, added, or maintained.

### 4.6 Grounded Interactive Q&A ("Ask Clarity")
- **Strictly Grounded Chat:** Answers synthesized exclusively from uploaded clauses.
- **Interactive Citation Badges:** Every assertion includes an inspectable citation tag (e.g. *Citation: Section 9.3, Page 5*) displaying the exact contractual source text.
- **Suggested Question Prompts:** Dynamic chips based on discovered risks (e.g. *"Can my landlord increase rent during this year?"*).

### 4.7 Action Plan & Pre-Signing Checklist
- **Chronological Action Stages:** Structured into *Pre-Signing Safeguards*, *Questions to Ask Before Committing*, and *External Community Resources*.
- **Integrated Export Options:** One-click checklist print, email summary export, and download as plain-language PDF digest.
- **Resource Directory:** Free local advocate contacts, state tenant handbooks, and confidential phone helplines.

---

## 5. Design System & Accessibility Specifications

| Attribute | Specification | Rationale |
| :--- | :--- | :--- |
| **Typography (Body)** | Plus Jakarta Sans / Inter (16px base) | Clean legibility for non-technical users and seniors |
| **Typography (Accent)** | Literata (Italic serif) | Reserved exclusively for primary screen descriptive subheadings |
| **Primary Color** | Calming Deep Sage (`#3E6B56`) | Promotes trust, composure, and emotional balance |
| **Background Color** | Warm Linen / Off-White (`#FAF8F5`, `#FFF8F5`) | Eliminates harsh sterile clinical glare |
| **Warning / Caution** | Soft Ochre Amber (`#D9822B`) | Warns without causing alarm or panic |
| **Risk / Double Liability**| Soft Terracotta (`#C05646`) | Clearly denotes financial exposure without hostile red flags |
| **Corner Curvature** | 12px – 20px (`rounded-2xl`) | Organic, welcoming feel aligned with modern humane software |
| **Elevation** | Subtle diffused drop shadows (0 4px 20px rgba(0,0,0,0.04)) | Replaces sharp dark borders with airy spatial separation |

---

## 6. Trust, Safety & Compliance Framework

1. **Mandatory Educational Disclaimers:** Every screen and AI explanation card features the persistent micro-tag: *"AI-generated — not a substitute for formal legal advice."*
2. **Zero Synthetic Professional Claims:** Clarity prohibits the use of fake attorney personas, fictional bar numbers, or pseudo-credentials in the UI.
3. **Transparent Uncertainty:** The platform refuses to infer illegible text, proactively prompting for re-scans instead of risking legal hallucinations.
4. **Data Sovereignty:** Temporary ephemeral processing sandboxes with automatic document purging within 24 hours.

---

## 7. Success Metrics (KPIs)

- **Comprehension Velocity:** Average time to locate and understand the top 3 contract risks (< 90 seconds).
- **Empowerment Rate:** % of users who copy negotiation scripts or export pre-signing checklists (> 45%).
- **Scan Success Rate:** First-pass OCR accuracy and rapid recovery from the warm upload assistance flow (> 92%).
- **User Relief Score:** Post-session sentiment survey measuring anxiety reduction before signing.
