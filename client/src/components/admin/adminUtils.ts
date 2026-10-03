import type { ZodTypeAny } from "zod";

/**
 * apiRequest throws `Error("400: {\"error\":\"…\"}")`. Pull out the server's
 * own message (Georgian for validation errors) so the owner sees what to fix.
 */
export function serverMessage(error: unknown, fallback = "ვერ მოხერხდა. სცადეთ ხელახლა."): string {
  if (!(error instanceof Error)) return fallback;
  const body = error.message.replace(/^\d{3}:\s*/, "");
  try {
    const parsed = JSON.parse(body);
    return typeof parsed?.error === "string" ? parsed.error : fallback;
  } catch {
    return fallback;
  }
}

/** First validation message for a form value, or null when it's valid. */
export function firstProblem(schema: ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.errors[0]?.message ?? "შეამოწმეთ ველები.";
}

/** Swap an item with its neighbour; returns the new id order, or null at the edge. */
export function moved<T extends { id: string }>(list: T[], index: number, direction: -1 | 1): string[] | null {
  const target = index + direction;
  if (target < 0 || target >= list.length) return null;
  const ids = list.map((x) => x.id);
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}
