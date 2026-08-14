# Reference designs

These are the E-motion designs as standalone HTML. **Read them for exact
spacing, hierarchy and states. Treat them as the spec, not as code to copy** —
the app implements them with the token system in `frontend/app/globals.css` and
the primitives in `frontend/components/ui/`, not by lifting inline styles.

## Source

Exported from the Claude Design project
`b8fdd0b7-6e1f-4495-9568-b0bbf535abf4` on 2026-08-14. That project remains the
editable original; this folder is a snapshot. If a design changes there, re-export
rather than hand-editing these files, so the two never disagree silently.

## Files

| File | Screen |
|---|---|
| `Landing.dc.html` | Marketing home: hero, styles, course list, instructor band, pricing, footer |
| `Instructors.dc.html` | Sanjay MJ — bio, facts, per-style approach |
| `Login.dc.html` | Split auth, photo left / form right |
| `Register.dc.html` | Split auth, form left / photo right |
| `Start.dc.html` | Onboarding, three steps: style → level → first lesson |
| `Profile.dc.html` | Signed-in home: stats, continue card, my courses, practice week |
| `Player.dc.html` | Lesson player at desktop, tablet, mobile landscape and portrait |
| `Mobile.dc.html` | Phone screens for landing, onboarding, profile and login |
| `Admin.dc.html` | Admin: overview, courses, members, payments, release calendar |

Support files the pages import: `support.js` (the design-canvas runtime),
`image-slot.js` (the fillable image placeholder), `ios-frame.jsx` (the phone
bezel used by `Mobile.dc.html` and `Player.dc.html`).

Not exported: `uploads/*.png`, two images pasted into the canvas. They are
placeholder art, not spec.

## Reading them

The pages use the design-canvas dialect, not plain HTML:

- `<sc-for list="{{ items }}" as="i">` repeats a block; `<sc-if value="{{ x }}">`
  branches. The data comes from the `<script type="text/x-dc">` block at the
  bottom of each file.
- `<image-slot>` is a placeholder for a photo that does not exist yet.
- `style-hover="…"` is the canvas's hover syntax.
- `<x-import … from="./ios-frame.jsx">` wraps a screen in the phone bezel. **The
  bezel is presentation for the canvas — it is not part of the product.**

Opening a file directly in a browser works; `support.js` renders it.

## Where the implementation deliberately differs

Recorded so nobody "fixes" these back:

- **Faint on-velvet text is 0.72 alpha, not 0.5.** Measured against the lightest
  gradient stop, 0.5 is 3.02:1 and fails the 4.5:1 floor; 0.72 is 4.56:1.
- **`ink-faint` is not used for informational text on cream** (2.66:1). Those
  uses take `ink-muted` (5.36:1).
- **The hero stat card shows the real lesson count**, not the design's "320+".
- **Onboarding ships step 1 only.** Steps 2 and 3 need an experience-level column
  and a recommendation rule; the indicator reads "Step 1 of 1" rather than
  implying two steps that do not exist.
- **Admin Payments and Release Calendar are not built.** There is no Stripe and no
  release scheduling, so the MRR, churn and drop dates in the design have no
  source. Building them would mean inventing numbers.
- **Gold on the lighter velvet is 2.78:1** and fails at eyebrow-label sizes.
  Unresolved: fixing it needs either a lighter gold or a darker backdrop, both
  palette decisions.
