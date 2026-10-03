# THE MR Studio — Design Guidelines

The single source of truth for how the public site looks, reads and moves.
Tokens live in `client/src/index.css`; this document explains them. If code and
this file disagree, fix one of them in the same change.

---

## 1. Principles

**Quiet, precise, expensive.** References: Aesop, The Row, Byredo, Le Labo.
Editorial restraint, perfect type, one or two memorable moments per page.

1. **Instant.** Nothing blocks the first impression. No preloader, no scroll lock,
   no layout shift.
2. **Photography speaks, UI stays silent.** Flat fills, hairlines, space. No
   gradients on UI, almost no shadows.
3. **Gold is jewellery, not paint.** Hairlines, numerals, one accent per screen.
   Never a gold button, never a gold gradient.
4. **One primary action colour.** Espresso in light mode, ivory in dark mode.
5. **Space is the luxury signal.** Fewer things per screen, generous section padding.
6. **Georgian first.** Every layout is designed with Georgian copy, then checked in
   English. Georgian words are long; nothing may break or clip.
7. **Two layouts, one brand.** Desktop reads like a fashion house's site; mobile
   feels like a native app. Same tokens, different composition.

---

## 2. Colour

Defined as CSS custom properties on `:root` (light) and `.dark` (dark) in
`client/src/index.css`. Components use the tokens, never raw hex.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--theme-bg` | `#F5F1EB` ivory | `#141110` espresso night | Page ground |
| `--theme-surface` | `#FDFBF8` porcelain | `#1C1816` | Sheets, inputs, raised areas |
| `--theme-surface-muted` | `#ECE6DD` linen | `#26211E` | Quiet fills, image placeholders |
| `--theme-text` | `#1F1A17` ink | `#F3ECE2` | Text |
| `--theme-muted1` | `#6B625A` | `#CBBFB1` | Secondary text (AA on bg + surface) |
| `--theme-muted2` | `#A69B90` | `#8C8075` | Placeholders, disabled, decoration only |
| `--theme-line` | `#E0D7CB` | `#3A322C` | 1px hairlines and borders |
| `--theme-accent` | `#2B2420` espresso | `#EADFCF` ivory | The one primary action colour |
| `--theme-accent-hover` | `#17120F` | `#F7EFE3` | Hover/pressed primary |
| `--theme-on-accent` | `#FAF6F0` | `#1A1512` | Text on primary |
| `--theme-champagne` | `#E3D3BC` | `#D9C3A3` | Selection washes, soft highlights |
| `--theme-gold` | `#A8875A` | `#C4A273` | Hairlines, dots, numerals at large size |
| `--theme-gold-text` | `#7D603A` | `#CDAE80` | Gold when it is text (AA ≥ 4.5:1) |
| `--theme-danger` | `#A4462A` | `#F2A07B` | Validation and errors |

Rules
- Gold at text sizes always uses `--theme-gold-text`.
- Selection = champagne wash + espresso hairline. Never grey.
- Disabled = `--theme-muted2` text on a dashed or absent border, never a faded primary.
- Overlays (sheet, lightbox) dim the page with espresso at 40%, plus a 6px blur.
- shadcn HSL variables (`--background`, `--primary`, …) mirror these values so the admin
  dashboard inherits the palette. Change both together.

---

## 3. Typography

### Families (self-hosted in `client/public/fonts`, no third-party font CDNs)

| Role | Latin | Georgian |
|---|---|---|
| Display | **Instrument Serif** (italic for one accent word) | **BPG Nino Mtavruli** (caps-only, tracked) |
| Text | **Geist** | **Noto Sans Georgian** |

- `--font-display`: Instrument Serif → BPG Nino Mtavruli → Georgia.
- `--font-text`: Geist → Noto Sans Georgian → system UI.
- BPG Nino Mtavruli is for display and eyebrows only. Georgian body text is never all caps.
- Georgian is never italic. Where Latin uses an italic accent word, Georgian stays upright.
- Preload exactly two files: Noto Sans Georgian (body, primary language) and
  Geist latin (the hero wordmark). Everything else uses `font-display: swap`.

### Scale (fluid, `clamp()`)

| Token | Size | Use |
|---|---|---|
| `--text-display` | 32 → 60px | Section titles |
| `--text-title` | 22 → 30px | Sub-section titles, card titles |
| `--text-lead` | 17 → 19px | Intro sentences |
| `--text-body` | 16px (17px Georgian) | Running text |
| `--text-small` | 14px | Secondary text, captions |
| `--text-eyebrow` | 11–12px | Eyebrows, labels: uppercase, tracked 0.2em (Latin) / 0.12em (Georgian) |

- Line height: display 1.0–1.05; Latin body 1.55; **Georgian body 1.6–1.7**.
- Display Georgian letter-spacing +0.02em; never negative.
- Measure: running text ≤ 66 characters.
- Numbers: `font-variant-numeric: tabular-nums` for prices, times, dates, reference numbers.
- Headings use `text-wrap: balance`.

---

## 4. Space, layout, shape

### Spacing scale (px)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`

- Section padding: **mobile 64–96px**, **desktop 96–160px** (`--section-y`).
- Gaps between sibling blocks use `gap`, not margins.

### Layout
| Range | Composition |
|---|---|
| < 768px | Single column, 20px gutters, app-like. Bottom tab bar. |
| 768–1023px | Two columns where content allows, 32px gutters. |
| ≥ 1024px | Editorial 12-column grid, content max **1320px**, 48px gutters. Split layouts, large imagery. No phone column. |

### Radius — one scale
| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 2px | Images on desktop, hairline frames |
| `--radius-s` | 8px | Inputs, tiles, chips, time slots |
| `--radius-m` | 16px | Sheets, panels, the appointment card |
| `--radius-full` | 999px | Buttons, pills, avatars, seals |

### Elevation
- Content has **no shadow**. Separation comes from space and 1px `--theme-line` hairlines.
- Only overlays (sheet, side panel, popover, lightbox) get `--shadow-overlay`.

---

## 5. Motion

- One easing everywhere: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- Durations: `--dur-ui: 200ms` (hover, press, toggles), `--dur-reveal: 700ms` (600–900ms).
- Reveals: opacity + 12–16px rise, or a `clip-path` mask on images and headlines.
  Stagger 60–90ms. Content is visible at rest; motion only adds to it.
- Images: slow scale 1.00 → 1.03 on hover/scroll, never faster than 900ms.
- Forbidden: bounce, tilt, magnetic buttons, custom cursors, confetti, parallax on text.
- `prefers-reduced-motion: reduce` → every movement becomes an instant or ≤150ms fade.
  Three switches cover it: the global rule in `index.css`, `<MotionConfig reducedMotion="user">`
  in `App.tsx` (framer keeps fades, drops movement), and `scrollBehavior()` from
  `lib/motion.ts` for every scripted scroll.

---

## 6. Components

### Header
Wordmark left, section links centre (desktop), language + theme toggles right.
Transparent over the hero, solid ivory with a hairline after 24px of scroll.

### Mobile bottom tab bar
The only floating element on phones: Home · Services · Gallery · **Book** · Contact.
"Book" opens the booking sheet. No other floating buttons on mobile.

### Buttons
- **Primary**: espresso pill (`--theme-accent`), 52px tall, 15px medium text. One per screen.
- **Secondary**: text link with a 1px underline that draws in on hover.
- **Quiet**: hairline pill, used inside the booking flow (calendar, change).

### Inputs
Large (56px), soft 1px border or underline, floating label, inline validation in calm
language under the field (`--theme-danger`). Focus = espresso border + 3px champagne ring.

### Seals (service icons)
Fine-line studio icons (`StudioIcons.tsx`) inside a gold-rimmed disc. Never stock
pictograms or emoji. One gold detail per icon.

### Booking (the most important screen)
- Phone: vaul bottom sheet, 94% height, drag handle, pinned footer action.
- Desktop: two columns — steps left, a live **appointment card** right that fills in as
  she chooses (service, specialist, date, time, duration, price).
- Stepper: thin line with numerals, not pills.
- Date: 14-day strip + calendar button; time: clean grid, booked slots softly disabled.
- Microcopy: "No prepayment. We'll confirm by email {within X hours}." Clients are confirmed by email, never by phone.
- **Confirmation = invitation card**: wordmark, her name, treatment, date and time in
  display serif, reference #, address with map link, Add to calendar, aftercare tip,
  "What to expect". A gold hairline draws in. No confetti.

### Prices (menu)
Service name left, hairline leader, tabular price right, duration muted.
Search is a minimal underline input. Each row has a quiet "Book" affordance.
The owner edits groups, treatments, prices and durations in the admin (ფასები);
the list, the services index and the booking sheet all read `/api/price-menu`.

### Services (index)
Desktop: large numbered rows (01 Nails, 02 Laser, 03 Aesthetics) with hairline dividers;
hover reveals a floating image. Mobile: full-width image tiles, title over image.

### Gallery
Strict grid with consistent ratios (4:5), category filter as text tabs with an animated
underline. Lightbox with keyboard and swipe.

### Footer
Big quiet sign-off: address, hours, phone, WhatsApp, Instagram, small map.
Large wordmark at the bottom edge. Contact details come from the admin
(პარამეტრები → სტუდიის ინფორმაცია); the map iframe mounts only when scrolled near.

### Offer banner
Inline at the very top, only when an offer is active. A gold dot, one line, dismissible.

### Install prompt
Only after a completed booking, inside the confirmation. Never on a first visit —
Chrome's own install banner is held from page load (`lib/installPrompt.ts`).

---

## 7. Imagery

- Real aspect ratios: 4:5 and 3:4 portrait, 3:2 landscape. No arbitrary crops.
- Desktop: full-bleed or `--radius-xs`. Mobile: `--radius-m` inside the app shell.
- Always set `width`/`height` or `aspect-ratio` so nothing shifts.
- Hero image is preloaded; everything below the fold is `loading="lazy"`.
- Alt text describes the work ("Almond gel manicure in nude"), not the file.

---

## 8. Voice and copy

- Every string goes through `t(ka, en)`. Georgian first, natural, never a word-for-word
  translation of English.
- Short, warm, certain. No exclamation marks, no emoji.
- Name things the way clients do: "Book", "Prices", "Your visit".
- Facts must be true. Owner-supplied facts (confirmation time, opening hours) stay
  hidden until the owner provides them — never invent numbers.
- No slogans or filler lines. The hero headline is the studio's name; section intros are
  a heading only. If a sentence doesn't sound natural in Georgian, cut it.

---

## 9. Accessibility and performance

- WCAG AA contrast for all text; visible focus ring on every interactive element.
- The booking flow is fully keyboard-usable; sheets trap focus and close on Esc.
- `prefers-reduced-motion` respected everywhere.
- LCP < 2.5s on a mid-range phone; no layout shift from fonts or images.
- Admin code and admin-only styles are split from the public bundle; so are the booking
  sheet (warmed when idle) and the toast UI. Nothing else joins the first-load bundle.
- A saved dark theme is applied by an inline script in `index.html` before first paint.

---

## 10. Admin

Georgian throughout (the owner's language), formal voice, same tokens as the site.
Built for a phone first: one scrolling tab row, one-tap call/WhatsApp on bookings,
confirmations before anything is deleted. Content tables (`price_groups`,
`price_items`, `studio_info`) are created and seeded by the server on start-up —
the droplet deploy has no migration step.

---

## 11. Emails

Confirmation and cancellation emails (`server/email-notifications.ts`) follow the
invitation card: 600px table layout, inline CSS, ivory ground, espresso text, one gold
hairline, display serif for date and time, Georgian + English. Must read correctly in
Gmail dark mode.
