type Issue = { message?: string };
type ZodLike = { name: string; issues: Issue[] };

function isZodError(error: unknown): error is ZodLike {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "ZodError" &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

/**
 * The owner-facing message for a validation error: the first issue's own message (the
 * schemas in shared/schema.ts write these in Georgian), else a readable summary.
 * Returns null when `error` is not a validation error.
 */
export function firstValidationMessage(error: unknown): string | null {
  if (!isZodError(error)) return null;
  return error.issues[0]?.message || "Validation error";
}
