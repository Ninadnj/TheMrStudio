import { insertStudioInfoSchema } from "@shared/schema";
import { defaultStudioInfo } from "@shared/studioDefaults";
import { describe, expect, it } from "vitest";
import { firstProblem, moved, serverMessage } from "@/components/admin/adminUtils";

describe("firstProblem (inline form errors in the admin)", () => {
  it("is null for a valid value", () => {
    expect(firstProblem(insertStudioInfoSchema, defaultStudioInfo)).toBeNull();
  });

  it("returns the schema's Georgian message for the first problem", () => {
    expect(firstProblem(insertStudioInfoSchema, { ...defaultStudioInfo, email: "nope" })).toBe("შეამოწმეთ ელ. ფოსტა");
  });
});

describe("serverMessage (errors from the API shown to the owner)", () => {
  it("pulls the server's own message out of an apiRequest error", () => {
    const error = new Error('400: {"error":"ფასი არ შეიძლება იყოს უარყოფითი"}');
    expect(serverMessage(error)).toBe("ფასი არ შეიძლება იყოს უარყოფითი");
  });

  it.each([
    ["not an Error", "oops"],
    ["non-JSON body", new Error("500: Internal Server Error")],
    ["JSON without a string error", new Error('400: {"error": 5}')],
  ])("falls back for %s", (_label, error) => {
    expect(serverMessage(error)).toBe("ვერ მოხერხდა. სცადეთ ხელახლა.");
    expect(serverMessage(error, "custom")).toBe("custom");
  });
});

describe("moved (reordering groups and treatments)", () => {
  const list = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("swaps an item with its neighbour", () => {
    expect(moved(list, 0, 1)).toEqual(["b", "a", "c"]);
    expect(moved(list, 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("returns null at either edge and never mutates the input", () => {
    expect(moved(list, 0, -1)).toBeNull();
    expect(moved(list, 2, 1)).toBeNull();
    expect(list.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});
