# Single source of truth for commands. Humans, Claude hooks, git pre-commit and CI
# all call these targets. Change a command here, never in a hook or workflow.

SHELL := /bin/bash
.SHELLFLAGS := -euo pipefail -c
.DEFAULT_GOAL := help

BIOME    := npx --no-install biome
VITEST   := npx --no-install vitest
# Hook scripts are stdlib Python; their tests run with pytest via uv (no Python deps in package.json).
PYTEST   := PYTHONPATH=. uvx --python 3.12 pytest -q -p no:cacheprovider
GITLEAKS ?= gitleaks

.PHONY: help setup dev fmt lint lint-debt typecheck test-unit test-hooks test-fast test build \
        check-fast check audit secrets

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'

setup: ## Install deps from package-lock.json and the git pre-commit hook
	npm ci
	@if git rev-parse --git-dir >/dev/null 2>&1; then \
		git config core.hooksPath .githooks && git config blame.ignoreRevsFile .git-blame-ignore-revs \
		&& echo "git hooks: .githooks"; fi
	@command -v uv >/dev/null || echo "note: install uv (brew install uv) to run the hook tests"
	@command -v $(GITLEAKS) >/dev/null || echo "note: gitleaks not installed (brew install gitleaks); CI still enforces it"

dev: ## Run the site locally (in-memory data without DATABASE_URL)
	npm run dev

fmt: ## Format + safe fixes
	$(BIOME) check --write

lint: ## Biome lint + format check (errors only; they fail the gate)
	$(BIOME) ci --colors=off --diagnostic-level=error

lint-debt: ## Show legacy lint warnings (not a gate; fix them as you touch files)
	$(BIOME) lint --colors=off --max-diagnostics=300

typecheck: ## tsc (strict)
	npm run check

test-unit: ## Vitest unit tests
	$(VITEST) run

test-hooks: ## Tests for the Claude Code hook scripts
	$(PYTEST) tests/hooks

test-fast: test-unit test-hooks ## Unit + hook tests (inner loop)

test: test-hooks ## All tests; unit tests with the coverage floor (vitest.config.ts)
	$(VITEST) run --coverage

build: ## Production build (client + server bundle)
	npm run build

check-fast: lint typecheck test-fast ## Gate before a turn ends / before commit

check: lint typecheck test build secrets ## Full gate (CI)

audit: ## Known vulnerabilities in production dependencies (needs network)
	npm audit --omit=dev --audit-level=high

secrets: ## Secret scan (gitleaks). Required in CI, skipped with a warning locally if missing
	@if command -v $(GITLEAKS) >/dev/null; then $(GITLEAKS) git --redact --no-banner .; \
	elif [ -n "$${CI:-}" ]; then echo "gitleaks is required in CI" >&2; exit 1; \
	else echo "WARNING: gitleaks not installed, secret scan skipped (brew install gitleaks)"; fi
