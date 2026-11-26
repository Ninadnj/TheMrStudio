import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BOOKING_REQUEST_EVENT,
  bookingCategories,
  bookingRef,
  type MenuGroup,
  requestBooking,
  treatmentsFor,
} from "@/lib/serviceMenu";

const item = (id: string, booking: string, nameEn = id) => ({
  id,
  groupId: "g",
  nameKa: `${nameEn}-ka`,
  nameEn,
  price: 10,
  durationMin: null,
  booking,
  position: 0,
});

const menu: MenuGroup[] = [
  {
    id: "g1",
    titleKa: "მანიკური",
    titleEn: "Manicure",
    shortKa: "მან.",
    shortEn: "Mani",
    position: 0,
    items: [item("a", "Manicure", "Classic"), item("b", "Pedicure", "Spa")],
  },
  {
    id: "g2",
    titleKa: "ლაზერი",
    titleEn: "Laser",
    shortKa: "ლაზ.",
    shortEn: "Laser",
    position: 1,
    items: [item("c", "Epilation", "Full Body"), item("d", "Manicure", "Full Body")],
  },
];

describe("treatmentsFor", () => {
  it("returns only the items bookable under the category, across groups, in menu order", () => {
    const result = treatmentsFor(menu, "Manicure");
    expect(result.map((t) => t.key)).toEqual(["a", "d"]);
  });

  it("keys treatments by id, so repeated names stay distinct", () => {
    const names = treatmentsFor(menu, "Manicure").map((t) => t.name);
    expect(names).toEqual(["Classic", "Full Body"]);
    expect(treatmentsFor(menu, "Epilation")[0]).toMatchObject({
      key: "c",
      name: "Full Body",
      groupKa: "ლაზ.",
      groupEn: "Laser",
    });
  });

  it("returns nothing for an unknown category or an empty menu", () => {
    expect(treatmentsFor(menu, "Haircut")).toEqual([]);
    expect(treatmentsFor([], "Manicure")).toEqual([]);
  });
});

describe("bookingRef", () => {
  it("is the first six hex characters of the id, upper-cased, without dashes", () => {
    expect(bookingRef("3f2a-9b1c-77de")).toBe("3F2A9B");
  });

  it("is stable for the same id", () => {
    const id = "0a1b2c3d-0000-4000-8000-000000000000";
    expect(bookingRef(id)).toBe(bookingRef(id));
  });
});

describe("bookingCategories", () => {
  it("lists the four bookable services in display order, each with both languages", () => {
    expect(bookingCategories.map((c) => c.value)).toEqual(["Manicure", "Pedicure", "Epilation", "Cosmetology"]);
    for (const c of bookingCategories) {
      expect(c.labelKa.trim()).not.toBe("");
      expect(c.labelEn.trim()).not.toBe("");
    }
  });
});

describe("requestBooking", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("dispatches the booking event with the requested service", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });
    vi.stubGlobal(
      "CustomEvent",
      class {
        constructor(
          public type: string,
          public init?: { detail?: unknown },
        ) {}
      },
    );

    requestBooking({ category: "Pedicure", treatmentKey: "b" });

    const event = dispatchEvent.mock.calls[0]?.[0] as { type: string; init: { detail: unknown } };
    expect(event.type).toBe(BOOKING_REQUEST_EVENT);
    expect(event.init.detail).toEqual({ category: "Pedicure", treatmentKey: "b" });
  });
});
