// The `*-theme-*` colour utilities are hand-written in client/src/index.css (they are not
// in tailwind.config.ts), so Tailwind can't warn when one is used but not defined: the class
// silently does nothing. The Oct 2026 redesign removed `.bg-theme-accent` while two admin
// buttons still used it, leaving ivory text on a transparent button.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "../..");
const css = readFileSync(path.join(ROOT, "client/src/index.css"), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx|ts)$/.test(name) ? [full] : [];
  });
}

const THEME_CLASS =
  /(?<![\w-])((?:[a-z-]+:)*)((?:bg|text|border|ring|from|to|via|fill|stroke)-theme-[a-z0-9-]+(?:\/\d+)?)(?![\w-])/g;

/** CSS selector text for a utility, e.g. `hover:bg-x/10` -> `.hover\:bg-x\/10`. */
const selectorFor = (variants: string, base: string) => `.${`${variants}${base}`.replace(/[:/]/g, (c) => `\\${c}`)}`;

describe("theme colour utilities", () => {
  const used = new Map<string, Set<string>>();
  for (const file of sourceFiles(path.join(ROOT, "client/src"))) {
    for (const match of readFileSync(file, "utf8").matchAll(THEME_CLASS)) {
      const selector = selectorFor(match[1], match[2]);
      const files = used.get(selector) ?? new Set<string>();
      files.add(path.relative(ROOT, file));
      used.set(selector, files);
    }
  }

  it("finds the classes it is meant to check", () => {
    expect(used.size).toBeGreaterThan(0);
  });

  it("every theme utility used in client/src is defined in index.css", () => {
    const missing = [...used]
      .filter(([selector]) => !css.includes(`${selector} {`) && !css.includes(`${selector},`))
      .map(([selector, files]) => `${selector} (used in ${[...files].join(", ")})`);
    expect(missing).toEqual([]);
  });
});
