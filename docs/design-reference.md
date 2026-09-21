# Clarity — Design Reference

## Source
Screens were designed in Google Stitch and exported as HTML/Tailwind into
`/design/stitch-exports/`. Treat those exports as the visual source of
truth for layout, spacing, and component styling — match them exactly
rather than defaulting to generic Tailwind/shadcn theme colors.

## Tone
Calm, human, reassuring — think "personal assistant," not "legal ops
dashboard" or "SOC command center." The person using this is often anxious
about a document. Every design decision should reduce anxiety, not add to
it (no harsh reds, no dense unlabeled data tables, no walls of text).

## Color Palette
- Background: warm cream / off-white
- Primary accent: soft sage green (buttons, active nav tab, positive tags)
- Warning accent: soft amber (worth-reviewing / action-required tags)
- Risk accent: muted red-brown, never harsh alert-red (risky / high-penalty
  tags)
- Text: dark charcoal, not pure black

## Typography
- Humanist sans-serif for body text and UI labels, base size 16-18px for
  accessibility
- Reserved italic serif accent used consistently for ONE recurring role:
  each screen's main descriptive subheading (e.g. "Let's make sense of
  your paperwork together," "See exactly what changed..."). Do not use the
  serif accent for body text, card labels, or buttons.

## Core Components
- **Bottom Line card grid** — 2-4 priority-finding cards with an icon, tag
  (e.g. "High Penalty," "Action Required"), title, one-line explanation,
  and a link to the relevant clause. Shows top 2 by default with a "Show
  all N highlights" expand. Stacks to a single column on narrow viewports.
- **Clause card** — numbered, section reference + plain-English title,
  risk-tag pill (top right), "What this means" block, original contract
  text block (citation styled, page/line reference), optional expandable
  "why this matters" note.
- **Fairness check bar** — horizontal bar showing where a clause falls
  between "Overly One-Sided" and "Tenant-Friendly," with a numeric score.
- **Chat message + citation block** — AI answer paired with a citation
  card showing the exact source clause text and section/page reference.
- **Action Plan checklist item** — checkbox, title, explanation, optional
  ready-to-send script with a copy button, status pill (Completed / Pay
  Attention / Clarification / Looks Standard).
- **Comparison card** — two-document header row, executive impact summary
  (favorable / unresolved / new risks counts), clause-by-clause diff cards
  tagged better-for-you / worse-for-you / same.
- **Document List / Picker** — list view of user documents reusing the 
  "recent documents" pattern from the Home screen. Empty state provides 
  a clear "Upload your first document" call to action.
- **Error state** — friendly icon, plain-language explanation of what went
  wrong, diagnostic preview (optional), concrete numbered fix suggestions,
  two clear action buttons.
- **Authentication Screens** — matches the warm cream background, sage 
  primary button, and Literata serif accent for the headline. No generic 
  auth templates.

## AI Disclosure Rules (applies to all screens)
- Label: "AI-generated — not a substitute for legal advice"
- Placement: once per screen, near the primary AI-generated content block
  (not on every individual card, not in 3+ places on the same screen)
- No fictional human names or professional credentials (e.g. "J.D.")
  attached to AI-generated analysis — attribute to "Clarity AI" only

## Trust Signals (real, not fabricated)
Use only verifiable/plausible claims as trust badges:
- "Private & Encrypted"
- "Citations from your exact document"
- "Free to use"
Do not use invented user counts, satisfaction percentages, or testimonial
quotes.

## Navigation
Persistent top nav across all screens: Home/Upload, My Documents, Compare,
Ask Clarity, Action Plan. The active tab must reflect the actual current
screen (e.g. the upload error state should highlight "Home/Upload," not
"Action Plan"). If no document is active, "My Documents", "Ask Clarity", 
and "Action Plan" should route to their respective document picker views, 
not redirect back to home. Account menu in header provides sign-out access.

## Screen List (build order)
1. Authentication (Login / Signup)
2. Home / Upload
3. My Documents (History List & Document Summary view)
4. Clause Detail view
5. Compare Two Documents
6. Ask Clarity (Picker & Chat)
7. Action Plan (Picker & List)
8. Upload Error State
