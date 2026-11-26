// The data hooks: what the site shows before and after the API answers.
import { beforeEach, describe, expect, it, vi } from "vitest";

const queryResult: { data: unknown; isLoading: boolean } = { data: undefined, isLoading: true };
vi.mock("@tanstack/react-query", () => ({ useQuery: () => queryResult }));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useMemo: <T>(fn: () => T) => fn(),
}));

const { usePriceMenu } = await import("@/lib/serviceMenu");
const { useStudio } = await import("@/lib/studio");
const { defaultStudioInfo } = await import("@shared/studioDefaults");

beforeEach(() => {
  queryResult.data = undefined;
  queryResult.isLoading = true;
});

describe("usePriceMenu", () => {
  it("returns an empty menu while loading", () => {
    expect(usePriceMenu()).toEqual({ menu: [], isLoading: true });
  });

  it("returns the menu from the API once loaded", () => {
    queryResult.data = [{ id: "g1", items: [] }];
    queryResult.isLoading = false;
    expect(usePriceMenu()).toEqual({ menu: [{ id: "g1", items: [] }], isLoading: false });
  });
});

describe("useStudio", () => {
  it("shows the launch defaults until the owner's saved details load", () => {
    expect(useStudio().email).toBe(defaultStudioInfo.email);
  });

  it("switches to the saved details once loaded", () => {
    queryResult.data = { ...defaultStudioInfo, email: "owner@example.com" };
    expect(useStudio().email).toBe("owner@example.com");
  });
});
