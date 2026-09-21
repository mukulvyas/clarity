---
name: Clarity
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#414944'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#717973'
  outline-variant: '#c0c9c2'
  surface-tint: '#3a6752'
  primary: '#25533f'
  on-primary: '#ffffff'
  primary-container: '#3e6b56'
  on-primary-container: '#b8e9cf'
  inverse-primary: '#a1d1b8'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fea047'
  on-secondary-container: '#6d3a00'
  tertiary: '#852b1f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a54234'
  on-tertiary-container: '#ffd4cd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceed3'
  primary-fixed-dim: '#a1d1b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#224f3c'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410100'
  on-tertiary-fixed-variant: '#81281c'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 2.5rem
    fontWeight: '600'
    lineHeight: 3rem
  headline-xl-mobile:
    fontFamily: Literata
    fontSize: 1.875rem
    fontWeight: '600'
    lineHeight: 2.25rem
  headline-lg:
    fontFamily: Literata
    fontSize: 2rem
    fontWeight: '500'
    lineHeight: 2.5rem
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
  headline-md:
    fontFamily: Literata
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
  headline-sm:
    fontFamily: Literata
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
  body-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.85rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.0625rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.65rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.45rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '600'
    lineHeight: 1.125rem
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system establishes an empathetic, reassuring environment for navigating complex legal documents. Blending the mindfulness and warmth of Headspace with the clean, structured modularity of Notion, it dismantles legal intimidation through human-scale clarity. 

The aesthetic is Tactile Minimalist: natural, paper-like warm linen backdrops, organic sage accents, soft editorial curves, and generous whitespace. It explicitly rejects conventional enterprise tropes—no cold clinical grays, no dense high-frequency data grids, no harsh crimson alarms, and no archaic legal motifs like gavels or scales. Instead, the interface acts as a thoughtful personal translator, turning opaque legalese into structured, conversational guidance that restores agency and calm to everyday people.

## Colors

The palette is rooted in grounding, organic earth tones designed to lower visual stress and physiological tension:

- **Primary Accent (`#3E6B56`):** Soft Sage Green. Evokes quiet confidence, restoration, and measured intelligence. Paired with hover state `#335947` and wash container `#E8F1EC`.
- **Secondary Accent (`#D9822B`):** Warm Amber. Flags clauses requiring attention or negotiation without inciting panic. Paired with background tint `#FEF6EB` and readable high-contrast text `#8C4E10`.
- **Tertiary Accent (`#C05646`):** Gentle Terracotta / Clay. Replaces aggressive operational error reds to highlight critical liabilities, indemnities, or high-risk clauses humanely. Paired with tint `#FDF0ED` and text `#7D281E`.
- **Positive / Standard (`#487A5B`):** Muted Moss Green. Conveys normal, balanced terms. Paired with tint `#EEF5F0` and deep forest text `#234E35`.
- **Neutrals & Surfaces:**
  - Canvas Root: Soft Linen (`#FAF8F5`) transitioning to warm parchment (`#F5F1EB`) for nested wells.
  - Surface Cards: Pure Crisp Paper White (`#FFFFFF`).
  - Outlines: Warm Oat Border (`#EBE5DC`).
  - Text Hierarchy: Deep Espresso (`#2C2825`) for body readability, Soft Taupe (`#68625D`) for explanatory context, and Light Taupe (`#9C948C`) for metadata and timestamps.
- **Clause Highlighter Overlays:** Transparent pastel marker overlays (Yellow `#FEF3C7` with 50% opacity; Sage `#D1FAE5` with 50% opacity; Peach `#FFEDD5` with 55% opacity) provide clear, non-destructive document annotations.

## Typography

Typography bridges editorial warmth and structural utility. 

- **Display & Section Headers (Literata):** A contemporary, literary serif that conveys trustworthiness, quiet intelligence, and editorial dignity. It grounds the reading experience like an authoritative yet approachable book, removing sterile technicality.
- **Interface & Document Body (Plus Jakarta Sans):** A friendly, open, geometric-humanist sans-serif. Set with a generous base font size (`17px` / `1.0625rem`) and relaxed line heights (`1.65` to `1.85`) to ensure effortless legibility across diverse reading capabilities and long contract sessions.
- **Letter Spacing:** Headlines maintain neutral tracking, while `label-md` and `label-sm` use a gentle `+0.015em` letter-spacing to optimize readability in pill badges and metadata tags.

## Layout & Spacing

The layout is built upon an intentional, spacious 12-column responsive grid system paired with strict max-width reading columns (`68ch` for continuous prose, `1200px` for comparative work benches).

- **Breakpoints:**
  - Desktop (`>1024px`): 12 columns, `1.5rem` gutters, `2rem` margins. Supports split-screen side-by-side view (Original Document left, Plain-English Translation right).
  - Tablet (`768px - 1023px`): 8 columns, `1.25rem` gutters, `1.5rem` margins. The comparison engine transforms into a tabbed or toggleable view.
  - Mobile (`<767px`): 4 columns, `1rem` gutters, `1.25rem` margins. Stacks clause citations vertically above conversational breakdowns.
- **Vertical Rhythm:** Element groupings honor generous vertical breathing room (`space-lg` to `space-xl`) between contextual sections to avoid visual density and cognitive fatigue.

## Elevation & Depth

This design system avoids harsh dropshadows, synthetic 3D skeuomorphism, and flat, abrasive borders. Visual layering is communicated through paper-like physical layering:

- **Baseline Card Elevation:** Pure white containers sit on top of `#FAF8F5` linen surfaces, defined primarily by a structural `1px` stroke in warm oat (`#EBE5DC`) combined with an ultra-diffused, amber-tinted ambient shadow: `0 4px 20px -2px rgba(44, 40, 37, 0.04), 0 2px 6px -1px rgba(44, 40, 37, 0.02)`.
- **Floating Controls & Modals:** Key accessibility toggles (Text Resizer, Read Aloud) and active floating translation drawers employ an elevated ambient wash: `0 12px 32px -4px rgba(62, 107, 86, 0.08), 0 4px 12px -2px rgba(44, 40, 37, 0.04)`, grounding the elements with subtle sage warmth.
- **Inset Wells:** Original contract excerpts and raw legalese sit inside sunken warm parchment containers (`#F5F1EB`) with no shadow and an interior `1px` tint border (`#E6DFD5`), making clear the distinction between raw legal jargon and Clarity's processed analysis.

## Shapes

The design system uses a deliberate, rounded geometry to evoke friendliness and safety:

- **Cards & Modular Panels:** Use `rounded-xl` (`1.5rem` / `24px`) to create soft, inviting frames that feel approachable rather than rigid.
- **Interactive Buttons & Chips:** Use pill-inspired full radiuses (`9999px`) for contextual badges, audio toggles, and status markers, keeping touchpoints pleasant and ergonomic.
- **Form Controls & Inputs:** Built with `rounded-lg` (`1rem` / `16px`), softening inputs without losing functional clarity.

## Components

### Buttons
- **Primary:** Warm sage green (`#3E6B56`) fill, white text, pill-shaped (`9999px`). Hover transitions smoothly to `#335947` with a gentle scale transition (`1.01`).
- **Secondary:** Transparent fill with `1.5px` border in `#EBE5DC`, text in `#2C2825`. Hover fills with `#F5F1EB`.
- **Audio / Read Aloud Action:** Pill button featuring a terracotta or sage waveform micro-icon, soft background (`#E8F1EC`), text in `#3E6B56`, activating a soothing, conversational voiceover of the clause.

### Status Chips & Badges
Chips convey meaning through friendly, plain-spoken dialogue rather than impersonal classifications:
- **Standard Clause:** Background `#EEF5F0`, text `#234E35`, border `#D4E7D9`. Label: *"Looks standard"*.
- **Needs Attention:** Background `#FEF6EB`, text `#8C4E10`, border `#FDE3C4`. Label: *"Pay attention"*.
- **Elevated Risk:** Background `#FDF0ED`, text `#7D281E`, border `#F9D5CE`. Label: *"Review carefully"*.

### Plain-English Breakdown Accordions
A core document pattern. The header displays an everyday summary in Literata (`headline-sm`) accompanied by a status chip. Expanding reveals two distinct compartments:
1. **The Translation:** High-legibility Plus Jakarta Sans explaining real-world implications in reassuring everyday language.
2. **The Source Clause:** An inset parchment well (`#F5F1EB`) displaying the exact raw legal text with interactive citation highlights.

### Comparison Cards (Side-by-Side)
Structured split card with synchronized scroll. Left pane displays raw legal text with subtle pastel clause highlights. Right pane displays the Clarity interpretation card. Clicking any phrase in the translation instantly anchors and illuminates the corresponding source passage.

### Form Inputs & Checkboxes
- **Inputs:** Crisp white background, `1px` oat border (`#EBE5DC`), generous padding (`0.875rem 1.25rem`). Active focus switches the ring to `#3E6B56` with a soft `3px` outer aura of `#E8F1EC`.
- **Checkboxes & Radios:** Curved soft squares (`6px` radius) and circles. Unselected state is bordered in `#9C948C`; selected state is flooded with `#3E6B56` featuring a gentle, rounded checkmark.

### Accessibility Bar (Persistent Floating Island)
A floating bottom-docked or top-right pill container containing:
- Text magnification control (`A-` / `A+`) adjusting base font size across the reading plane dynamically.
- Ambient contrast toggle (Linen Standard vs. High Contrast Cream).
- Audio narration controller with speed adjustment (`0.8x`, `1.0x`, `1.2x`).