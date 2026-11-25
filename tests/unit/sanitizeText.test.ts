import { describe, expect, it } from "vitest";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

describe("stripDecorativeSymbols", () => {
  it.each([
    ["✨ Gel manicure ✨", "Gel manicure"],
    ["Pedicure → 40 ₾", "Pedicure 40 ₾"],
    ["ლაზერული ეპილაცია 💅", "ლაზერული ეპილაცია"],
    ["  spaced   out  ", "spaced out"],
    ["✓ done ✔", "done"],
  ])("cleans %j", (input, expected) => {
    expect(stripDecorativeSymbols(input)).toBe(expected);
  });

  it("keeps Georgian text, digits and the lari sign untouched", () => {
    expect(stripDecorativeSymbols("მანიკური 5 ₾-დან")).toBe("მანიკური 5 ₾-დან");
  });

  it.each([null, undefined, ""])("returns an empty string for %j", (input) => {
    expect(stripDecorativeSymbols(input)).toBe("");
  });
});
