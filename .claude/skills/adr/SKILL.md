---
name: adr
description: Record an architecture decision in docs/decisions/NNNN-title.md. Use when choosing between real alternatives (library, data model, API shape, model/provider, infra, a rule that changes how the team works) or when the user says "record this decision", "ADR", "why did we choose X".
argument-hint: "[decision title]"
---

# Architecture Decision Record

Decision: $ARGUMENTS

## Checklist
1. `ls docs/decisions/` and take the next number (4 digits, zero-padded).
2. Copy `docs/decisions/0000-template.md` to `docs/decisions/NNNN-<kebab-title>.md`.
   Title is imperative: "Use X for Y".
3. Fill in Context (forces, constraints), at least two real Options with pros/cons, the
   Decision with the *one* deciding reason, and Consequences including the costs accepted.
4. If it replaces an earlier ADR, set the old one to `superseded by NNNN` (only the Status
   line changes; ADRs are otherwise immutable).
5. Link it from `docs/ARCHITECTURE.md` if it changes structure.

## Verification (mandatory)
Show the file path, confirm the number is unique (`ls docs/decisions/`), and that Status,
Date, Options (≥2) and Consequences are all filled.
