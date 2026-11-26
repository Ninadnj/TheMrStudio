# Spec: <feature name>

- Status: draft | approved | done
- Owner: <name> · Date: YYYY-MM-DD

## Goal
One or two sentences: what the user can do after this ships that they can't today.

## Non-goals
What this explicitly will NOT do (prevents scope creep).

## Acceptance criteria
Each one testable. Prefer Given / When / Then.
- [ ] AC1: Given ..., when ..., then ...
- [ ] AC2: ...

## Design sketch
Modules touched, data shapes, failure handling. Link an ADR for real decisions.

## Test plan
| AC | Test (file::name) | Type (unit/integration) |
|---|---|---|
| AC1 | tests/unit/test_x.py::test_... | unit |

## Eval plan (LLM features only)
- Dataset: `evals/datasets/<name>.jsonl`, N cases, which tags (happy path, edge, adversarial)
- Graders, in priority order: exact/regex/schema → assertions → LLM judge (rubric file)
- Pass bar: score ≥ X, no regression > `EVAL_MAX_DROP` vs baseline; cost/latency budget

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
