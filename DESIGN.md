# je.design — Design System & Style Reference

> **Brand:** Jeremy Ellsworth Designs LLC (`je.design`) — a premium brand & vehicle-wrap design studio.
> **This file is the single source of truth for the site's visual language.** Every new page, component, or admin screen MUST follow the tokens, patterns, and rules below so the product stays cohesive. When something here is ambiguous, match the closest existing component in `src/globals.css` rather than inventing a new style.

All design tokens live as CSS custom properties in `src/globals.css` (`:root`). Always reference the token, never a hard-coded hex/px equivalent.

---

## 1. Brand personality

Bold, confident, hand-crafted, high-energy. Think street-poster meets premium studio: heavy compressed display type, a single electric-yellow accent on near-black, generous negative space, and tactile micro-interactions (custom cursor, scaleY button fills, scroll reveals). Never sterile, never corporate-blue. The yellow is a scalpel — used sparingly for emphasis, never as a flood.

---

## 2. Color system

Defined in `:root`. Use the variable, not the literal value.

| Token | Value | Role |
| --- | --- | --- |
| `--black` | `#0a0a0a` | Default page background |
| `--ink` | `#000000` | Pure black — text on yellow, inverted buttons, overlays |
| `--yellow` | `#fff600` | **The** accent — CTAs, eyebrows, links, highlights, selection |
| `--white` | `#f6f6f8` | Primary text on dark; light-surface backgrounds |
| `--gray` | `#8f8f8f` | Secondary / supporting text, captions, subtitles |
| `--gray-dark` | `#53545c` | Tertiary text, disabled, faint meta |
| `--surface` | `#111111` | Raised dark surfaces (cards, menus on black) |
| `--line` | `rgba(255,255,255,0.09)` | Hairline borders on dark |
| `--line-dark` | `rgba(0,0,0,0.12)` | Hairline borders on light surfaces |

**Rules**
- The site is **dark-first**: `body` is `--black` with `--white` text.
- Yellow is an accent only. A screen should read as black + white with yellow punctuation. Avoid large yellow fills except the primary CTA, the spin badge, and intentional "billboard" moments.
- Text contrast is non-negotiable: body text uses `--white`, supporting text `--gray`. Never put `--gray` on `--surface` for anything that must be read. Text on `--yellow` is always `--ink`.
- `::selection` is `--yellow` background / `--ink` text.
- **Never introduce purple/indigo/violet.** The palette above is the whole palette; add a new ramp only if the user explicitly asks.

---

## 3. Typography

Fonts are loaded in `index.html` (Google Fonts) plus a local `@font-face`.

| Token | Family | Use |
| --- | --- | --- |
| `--font-display` | **Archivo** (variable, wght 100–900, wdth 62–125) | All headings, buttons, eyebrows, wordmark, stat numbers |
| `--font-body` | **Inter** (400/500/600/700) | Body copy, paragraphs, UI labels, form fields |
| `--font-serif` | **Instrument Serif** (italic) | Accent words inside display headings (the "win their market" italic) |
| `Caveat` / `Robertson` | handwritten | Signature / scribble accents only (e.g. owner's note) |

**Signature display trait:** Archivo is used **expanded and heavy** — `font-weight: 800–900` with `font-stretch: 110%–122%`, uppercase, tight tracking (`letter-spacing: -0.02em` to `-0.03em`), and line-height ≈ `0.98`. This compressed-wide weight is the brand's loudest visual cue; keep it consistent on every big headline.

**The serif accent pattern:** inside a display headline, a key phrase switches to `--font-serif`, italic, `font-stretch: 100%`, often colored `--yellow`. Markup uses `<span class="hero__accent">…</span>`.

### Type scale (clamped, fluid)

| Element | Class | Size |
| --- | --- | --- |
| Hero title | `.heroB__title` | `clamp(46px, 6.2vw, 104px)` |
| Section title | `.section__title` | `clamp(40px, 6.4vw, 92px)`, `line-height: 0.98` |
| Page hero title | `.pagehero__title` | `clamp(38px, 5.6vw, 84px)` |
| Large statement | `.about__statement` | `clamp(26px, 3.8vw, 52px)`, `line-height: 1.18` |
| Eyebrow | `.eyebrow` | `13px`, `letter-spacing: 0.22em`, uppercase, `--yellow` |
| Body | `body` | `16px`, `line-height: 1.6` |
| Subtitle | `.section__sub` / `.pagehero__sub` | `16.5–17px`, `--gray`, max-width ~440–520px |

**Line-height rule:** display/headings ≈ `0.98–1.18` (tight); body `1.6`. Limit any one screen to ≤ 3 font weights.

### The eyebrow (section label)
Reusable kicker above headings: uppercase, `0.22em` tracking, `--yellow`, with a `34px` yellow dash rendered via `::before`. Markup: `<span class="eyebrow">Selected Work</span>`. Dark-surface variant: `.eyebrow--dark` (switches to `--ink`).

---

## 4. Spacing, layout & motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--container` | `1370px` | Max content width — wrap content in `.container` |
| `--gutter` | `clamp(20px, 4vw, 48px)` | Horizontal page padding |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | **The** easing for nearly all transitions |

- **8px spacing system.** All margins, padding, and gaps should be multiples of 8 (use the fluid `clamp()` idiom for responsive rhythm, e.g. `clamp(40px, 6vw, 72px)`).
- **Section rhythm:** `.section` = `padding: clamp(90px, 12vw, 160px) 0`. Use `.section--padless` to trim bottom padding, `.section--panel` for a contained panel block.
- **Section heads:** `.section__head` (bottom margin), with modifiers `--split` (title left / sub right, flex-end), `--center` (centered).
- **Containers:** every full-width section places its content inside `<div class="container">`.

---

## 5. Buttons

Defined under `/* Buttons */` in `globals.css`. Base class `.btn` + one variant. **Always pill-shaped (`border-radius: 999px`), Archivo 700, with the signature scaleY fill-on-hover.**

```html
<!-- Primary -->
<a class="btn btn--solid"><span>Start a project</span><span class="btn__arrow">→</span></a>
<!-- Secondary / outline -->
<button class="btn btn--ghost"><span>View work</span></button>
<!-- On a yellow/light surface -->
<a class="btn btn--invert"><span>Get started</span></a>
<!-- Compact -->
<button class="btn btn--sm btn--solid"><span>Save</span></button>
```

| Variant | Default | Hover (fill via `::before scaleY`) |
| --- | --- | --- |
| `.btn--solid` | yellow bg, ink text | fills `--white` |
| `.btn--ghost` | transparent, `1.5px --line` border, white text | fills `--yellow`, text → ink, border → yellow |
| `.btn--invert` | ink bg, yellow text | fills `--white`, text → ink |

**Mechanics (don't break these):**
- Padding `18px 36px`; `.btn--sm` = `15px 32px`.
- Label text MUST be wrapped in `<span>` (it sits at `z-index: 1` above the `::before` fill).
- Optional `.btn__arrow` span nudges `translateX(4px)` on hover.
- Transitions run on `--ease-out`. The fill animates `transform: scaleY(0 → 1)` from the bottom.
- Admin/CMS also uses `.cms__btn-ghost` (compact neutral) and `.cmsm__danger` (destructive red text) — use those inside the admin, and `.btn btn--sm btn--solid` for primary save actions.

---

## 6. Surfaces, cards & borders

- **Radii scale:** `999px` (pills/buttons/tags), `10px` (default cards, media, menus, inputs), `12–14px` (large feature cards & panels). Don't use arbitrary radii.
- **Cards on dark:** `--surface` (`#111`) or transparent with a `1px --line` border; media inside clipped to `10px`.
- **Dropdowns/menus on dark:** `#141414` bg, `1px --line` border, `border-radius: 10px`, shadow `0 24px 60px rgba(0,0,0,0.5)`.
- **Hairlines:** always `--line` on dark, `--line-dark` on light surfaces — never a solid gray border.
- **Tags / filter pills:** `.filter` and similar — pill (`999px`), `1px --line`, `13.5px` Archivo 600; active state = `--yellow` bg + `--ink` text (`.is-active`).

---

## 7. Signature components & patterns

- **Header** (`.header`): fixed, transparent at top; on scroll gains `.is-scrolled` → `rgba(10,10,10,0.72)` + `backdrop-filter: blur(18px)` + bottom `--line`. Hides on scroll-down via `.is-hidden`. Nav links are uppercase `--gray` → `--white` with an animated yellow underline (`::after` scaleX). Wordmark: Archivo 800 expanded, the `.` rendered yellow via `<em>`.
- **Custom cursor** (`.cursor` / `.cursor-dot`): yellow ring + dot, grows on hover, becomes a yellow "View" disc over project cards (`data-cursor="view"`). Hidden on touch/coarse pointers. Add `data-cursor` hooks to interactive media instead of restyling the cursor.
- **Spin badge** (`.spinbadge`): yellow circle with rotating text, anchored to the container edge, straddling the hero/section seam.
- **Scroll reveal** (`.reveal`): elements start `opacity: 0; translateY(36px)` and animate in. Add `.reveal` to entrance content; respect `prefers-reduced-motion` (handled globally — reveals show instantly).
- **Page hero** (`.pagehero`): tall top padding (`clamp(150px,18vh,200px)`), eyebrow + `.pagehero__title` (+ optional `.hero__accent` serif word) + `.pagehero__sub`.

---

## 8. Forms & inputs (CMS / admin)

Admin building blocks live in `components/cms/Ui.jsx` — **reuse them, don't hand-roll inputs.**

- `CmsTopbar` — page header (title, subtitle, action slot).
- `Field` — labeled text/textarea; supports `half`, `hint`, controlled `onChange`.
- `Select` — labeled dropdown; `options` accepts `string[]` or `{ value, label }[]`.
- `FieldGrid` — two-column responsive field layout.
- `ChipPicker` — multi-select chip group.
- `EditSection` — collapsible titled section with item count.
- `ImageField` / `VideoField` — media inputs wired to Supabase Storage uploads.

Inputs sit on dark surfaces with `--line` borders and `10px` radius. Labels use `--gray` uppercase-ish small caps via `.cmsc-field__label`. Primary action = `.btn btn--sm btn--solid`; destructive = `.cms__btn-ghost .cmsm__danger`. Save bars use `.cmsc-savebar` with a dirty/saved status string.

---

## 9. Responsive & accessibility

- **Breakpoints in use:** `1024px` (tablet — grids collapse to 2-up), `900px` (admin/layout shifts), `600px` (mobile — single column). Match these; don't invent new ones.
- Mobile nav is a full-screen overlay (`.mobile-menu`); admin uses a bottom tab bar (`.cms__bottomnav`).
- Honor `prefers-reduced-motion: reduce` — all reveal/scroll animations must no-op (already handled globally; keep new animations inside that guard).
- Maintain WCAG-AA contrast at all times, including transitional states (e.g. header going transparent → solid). Never rely on yellow text on white or gray text on `--surface` for essential content.
- All interactive controls need a visible hover/focus state; keep `:focus-visible` legible against dark backgrounds.

---

## 10. Do / Don't

**Do**
- Reference `:root` tokens for every color, font, container, and easing value.
- Reuse existing classes (`.btn`, `.eyebrow`, `.section`, `.container`, `.filter`, CMS `Ui.jsx`) before writing new CSS.
- Keep Archivo headings heavy + expanded + uppercase; pair with the Instrument Serif italic accent for emphasis.
- Animate with `--ease-out` and keep motion purposeful (reveals, button fills, underline wipes).

**Don't**
- Don't add new colors — especially no purple/indigo/violet — without an explicit request.
- Don't hard-code hex or px values that duplicate an existing token.
- Don't use more than 3 font weights on a screen, or square-cornered buttons (buttons are always `999px`).
- Don't flood large areas with yellow, or place low-contrast text on busy/!light surfaces.
- Don't bypass `Ui.jsx` form primitives in the admin.
