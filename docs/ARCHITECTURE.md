# Architecture

> Keep this short and true. Update it in the same change as any structural change.

## Overview
```
Browser (React SPA, wouter routes, React Query)
   │  /api/*  (JSON)                         public: price menu, studio info, hero, gallery,
   ▼                                           offers, booking request (POST)
Express (server/index.ts → routes.ts)        admin (requireAuth, session): bookings, content
   ├─ storage.ts   DatabaseStorage (Drizzle → Postgres/Neon) or in-memory when no DATABASE_URL
   │               ensureContent(): creates + seeds content tables on start-up (no migrations)
   ├─ email-notifications.ts  nodemailer: owner alert on request, client email on Confirm
   ├─ google-calendar.ts      event created only when the owner approves a booking
   ├─ uploads                 multer → Cloudinary (CLOUDINARY_URL) or local .local/storage
   └─ gemini-chat.ts          POST /api/chat; NOT called by the current site (see PROGRESS)
shared/schema.ts  tables + zod insert schemas, used by both client forms and server routes
```

## Modules
| Path | Responsibility |
|---|---|
| `client/src/pages/` | `Home` (public site), `AdminLogin`, `AdminDashboard` |
| `client/src/components/` | Site sections, `BookingForm`, `admin/` editors, `ui/` (shadcn) |
| `client/src/lib/` | Pure helpers + data hooks (`studio.ts`, `serviceMenu.ts`, `i18n.tsx`, `reveal.ts`) |
| `server/routes.ts` | All HTTP routes; validation with zod schemas from `shared/` |
| `server/storage.ts` | `IStorage` with DB and in-memory implementations |
| `shared/` | DB schema, zod schemas, launch defaults |
| `scripts/hooks/` | Claude Code hooks (enforcement) |

## Quality gates
| Rule | Enforced by |
|---|---|
| Edited file is formatted + lint-clean | PostToolUse `post_edit_lint.py` (Biome) |
| Lint + tsc + unit/hook tests pass before a turn ends | Stop `stop_check.py` → `make check-fast` |
| Same before every commit | `.githooks/pre-commit` (working tree, not the staged snapshot) |
| No `db:push`, rm -rf, force/main push, curl\|sh, `.env` access; ask before ssh/deploy | PreToolUse `pre_bash_guard.py` + `permissions.deny` |
| Gate and deploy config can't change silently | PreToolUse `pre_file_guard.py` → approval prompt |
| Coverage ≥ 80% on tested modules (ratchet list), production build, secrets | `make check` in CI |
| Known-vulnerable production deps | `make audit` (CI job) |
| Lint debt only shrinks | LEGACY DEBT overrides in `biome.jsonc` (per file) |

## External services (env vars in `.env.example`)
Postgres (Neon) · Gmail SMTP · Google Calendar (service account) · Cloudinary · Gemini (unused).
