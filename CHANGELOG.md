# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Quality gates: Biome, Vitest (32 tests), Makefile, Claude Code hooks/skills/subagents, CI.

### Security
- Production dependencies: 20 known vulnerabilities (1 critical, 11 high) → 0
  (`npm audit --omit=dev`). Non-breaking fixes; express 4.22.3; drizzle-orm 0.45.4;
  nodemailer 10.5.0; zod 4.6.7 (+ drizzle-zod 0.8.3, @hookform/resolvers 5.9.2,
  zod-validation-error 5.0.0); @google/genai 1.52.0.

### Performance
- Production server compresses responses (brotli/gzip) and caches hashed assets for a
  year; HTML is always revalidated. First-load JS 269 → 87 KB, CSS 123 → 22 KB.

### Fixed
- Services: the Aesthetics tile without a photo is a framed card with the seal as a monogram,
  not an empty box. Dark mode: the hero image no longer glares as a white block.
- Admin login, Offers "დამატება" and Gallery "დამატება" buttons had invisible labels since
  the Oct 2026 redesign (the `.bg-theme-accent` utility was deleted). Restored it, plus
  a test that every `*-theme-*` colour utility used in `client/src` is defined.

### Removed
- Unused Replit object-storage code (`server/objectStorage.ts`, `objectAcl.ts`) and
  `@google-cloud/storage`.

### Changed
- Codebase formatted with Biome (formatting only; see `.git-blame-ignore-revs`).
