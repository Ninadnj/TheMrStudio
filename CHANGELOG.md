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

### Removed
- Unused Replit object-storage code (`server/objectStorage.ts`, `objectAcl.ts`) and
  `@google-cloud/storage`.

### Changed
- Codebase formatted with Biome (formatting only; see `.git-blame-ignore-revs`).
