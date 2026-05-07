const DECORATIVE_SYMBOLS =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]|[\u2190\u2192\u2713\u2715\u2716\u2714\u276F\u276E]/gu;

export function stripDecorativeSymbols(value: string | null | undefined): string {
  return (value || "").replace(DECORATIVE_SYMBOLS, "").replace(/\s{2,}/g, " ").trim();
}
