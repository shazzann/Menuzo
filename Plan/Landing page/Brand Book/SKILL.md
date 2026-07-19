---
name: saas-brand-book
description: Creates a complete SaaS brand book / brand identity guide — brand strategy, logo direction, color palette (with implementation-ready CSS variables and Tailwind tokens), typography scale, voice & tone, spacing/elevation system, iconography, and UI component patterns — delivered as an inline, agent-ready spec that can be handed straight to a coding agent for implementation in a React/Tailwind (or other) codebase. Use this whenever the user asks to build a "brand book," "brand guide," "style guide," "design system," or "brand identity," or wants to define colors, typography, voice, or visual identity for a SaaS product, app, or startup — even if they don't use the exact phrase "brand book."
---

# SaaS Brand Book

A brand book's job is to remove ambiguity. Once it exists, nobody — including a coding agent implementing the UI — should have to guess which blue is "the" blue, what the buttons are called, or whether the product sounds playful or serious. Write it so it can be pasted straight into a project's README or a `design-tokens` file and acted on without follow-up questions.

## Step 1: Gather the brief

Before drafting, you need: product name, a one-line description of what it does, who it's for, and 3-5 personality adjectives (or something to reverse-engineer them from, like a competitor they like or dislike).

Check the conversation first — if the product, audience, or stack has already been discussed, use that instead of re-asking. Only ask about what's genuinely missing, and ask it in one batch, not one question at a time. If the person gives you almost nothing ("make a brand book for my SaaS"), it's fine to draft reasonable assumptions and state them up front rather than stalling on questions — a brand book with stated assumptions is more useful than no brand book.

Useful things to know if available, roughly in order of how much they change the output:
- Product name and one-liner
- Target user (e.g., "solo devs," "finance teams at mid-size banks," "university students")
- 3-5 personality adjectives, ideally paired with what it's *not* (e.g., "confident, not cocky")
- Existing constraints: a logo that already exists, a color already in use, a tech stack (React/Tailwind is the default assumption for SaaS unless told otherwise)
- Light, dark, or both — SaaS dashboards skew dark-mode-first; marketing sites skew light-first

## Step 2: Brand foundation

Write this before touching colors — visual choices should justify themselves against it, not the other way around.

- **Mission, one line.** What the product does and for whom, in plain language, no jargon.
- **Personality, 3-5 adjectives.** For each, pair it with what it's *not*, since the contrast is what actually constrains design decisions. "Precise, not clinical" leads somewhere different than "precise, not playful."
- **Voice pillars.** 2-3 short rules for how the product talks (e.g., "explains the why, not just the what"; "never blames the user for an error").
- **Audience snapshot.** Two or three sentences on who's using this and what they need from it emotionally, not just functionally (confidence, speed, reassurance, control).

## Step 3: Color system

Every SaaS brand book needs, at minimum: a primary, a secondary/accent, a neutral scale, and semantic colors (success, warning, error, info). Give each one a light and dark pairing even if the product is single-mode for now — retrofitting dark mode later is far more painful than defining both up front.

Deliver colors in three layers so nothing needs re-deriving downstream:

1. A human-readable table (name, hex, where it's used)
2. CSS custom properties
3. A Tailwind config snippet (or the equivalent for whatever stack was mentioned — styled-components theme object, MUI theme, etc.)

Example of the format to follow (values are illustrative, not prescriptive — derive real ones from the brand's personality):

```
| Token       | Light      | Dark       | Usage                          |
|-------------|------------|------------|---------------------------------|
| primary     | #1D4ED8    | #60A5FA    | primary buttons, links, focus   |
| accent      | #16A34A    | #4ADE80    | highlights, success states      |
| neutral-900 | #0F172A    | #F8FAFC    | body text / inverse background  |
| neutral-050 | #F8FAFC    | #0F172A    | page background / inverse text  |
| danger      | #DC2626    | #F87171    | errors, destructive actions     |
```

```css
:root {
  --color-primary: #1D4ED8;
  --color-accent: #16A34A;
  --color-danger: #DC2626;
  /* ... */
}
[data-theme="dark"] {
  --color-primary: #60A5FA;
  --color-accent: #4ADE80;
  --color-danger: #F87171;
}
```

```js
// tailwind.config.js excerpt
colors: {
  primary: { DEFAULT: 'var(--color-primary)' },
  accent: { DEFAULT: 'var(--color-accent)' },
  danger: { DEFAULT: 'var(--color-danger)' },
}
```

Check contrast, don't eyeball it — body text on its background should clear WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components). This matters more, not less, in dark themes, where a tempting saturated accent often fails contrast against a dark background even though it "looks fine" on screen.

## Step 4: Typography

Pick two font families max — one for headings, one for body (they can be the same family at different weights). Give a fallback stack, not just a name, and prefer fonts available on Google Fonts or a similarly free/easy source unless told the project already has licensed fonts.

Provide a type scale as a table, not prose:

```
| Level | Size (px/rem) | Weight | Usage              |
|-------|----------------|--------|---------------------|
| h1    | 36px / 2.25rem | 700    | page titles         |
| h2    | 28px / 1.75rem | 600    | section headers     |
| body  | 16px / 1rem    | 400    | default text        |
| small | 14px / 0.875rem| 400    | captions, metadata  |
```

## Step 5: Logo / mark direction

Don't try to generate an actual logo file — describe a direction instead: wordmark vs. icon+wordmark, shape language (geometric vs. organic, sharp vs. rounded corners), whether it should work as a single-color favicon, and what to avoid (e.g., "no literal illustration of the product's subject matter — keep it abstract"). If a logo already exists, skip this step and note usage rules instead: minimum size, clear space, and what backgrounds it's approved for.

## Step 6: Spacing, radius, elevation

A short, consistent system beats a large arbitrary one. A typical baseline:

- Spacing scale: a base unit (commonly 4px or 8px) with a handful of steps (4/8/12/16/24/32/48/64)
- Border radius: 2-3 steps (e.g., sm: 6px, md: 10px, lg: 16px) — pick fewer if the brand personality is "precise/technical," more and rounder if it's "friendly/approachable"
- Elevation/shadow: 2-4 levels, defined once as reusable tokens rather than ad hoc per component

## Step 7: Iconography & imagery

State the icon set (e.g., `lucide-react` is a sensible default for a React/Tailwind stack — it's what's available in this environment's React artifacts too), stroke width, and whether icons are outlined or filled. For imagery, state a direction (abstract/geometric illustration, photography, no imagery at all) rather than generating actual images unless the person separately asks for that.

## Step 8: Voice & tone in practice

Abstract voice pillars don't stick until they're shown applied. Give 2-3 short before/after microcopy pairs so the voice is unambiguous in the moments that matter most: an empty state, an error message, a success confirmation, a button label. Keep each pair to one line — this is a reference, not a copywriting sample pack.

## Step 9: Component patterns

Short rules, not full code (unless the person asks for actual component code, in which case write it as you normally would for their stack). Cover at minimum: buttons (primary/secondary/ghost/destructive, and what distinguishes each visually), cards, form inputs (default/focus/error states), and badges/tags. State the rule, not just the token: e.g., "primary buttons use `--color-primary` fill with white text; never more than one primary button per view."

## Step 10: Do's and Don'ts

Close with a short, scannable list of the most common ways this specific brand gets misapplied — not generic design advice. Ground each one in the personality from Step 2 (e.g., if the brand is "calm, not sterile," a Don't might be "don't use pure white (#FFFFFF) backgrounds — they read as sterile; use the neutral-050 token instead").

## Output structure

Default to inline plain text/markdown in the chat response, not a downloadable file — this is what makes it pasteable straight into a repo or handed to a coding agent. Only produce a `.docx` or other file if the person explicitly asks for a downloadable document. Use this exact section order:

```
# [Product Name] Brand Book

## 1. Brand Foundation
## 2. Color System
## 3. Typography
## 4. Logo & Mark
## 5. Spacing, Radius & Elevation
## 6. Iconography & Imagery
## 7. Voice & Tone
## 8. Component Patterns
## 9. Do's and Don'ts
```

## Scaling the depth

Not every request needs the full nine sections. For an early-stage or "just exploring" project, a condensed version — foundation + colors + type + voice, skipping the full component-pattern breakdown — is usually more useful than an exhaustive document nobody will read. For a product already in active development with an established stack, go full depth, and lean harder into Step 3's CSS/Tailwind output since that's what actually gets copy-pasted into the codebase. If it's unclear which the person needs, default to the condensed version and offer to expand any section.
