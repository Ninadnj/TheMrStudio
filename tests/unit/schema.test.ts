// Validation the owner sees in the admin (Georgian messages) and the API relies on.

import { chatRequestSchema, insertBookingSchema, insertPriceGroupSchema, insertPriceItemSchema } from "@shared/schema";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { firstValidationMessage } from "../../server/validation";

const validItem = {
  groupId: "g1",
  nameKa: "მანიკური",
  nameEn: "Manicure",
  price: 40,
  booking: "Manicure",
};

const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? null : result.error?.issues[0]?.message;

describe("price item (admin ფასები tab)", () => {
  it("accepts a valid item, with or without a duration", () => {
    expect(insertPriceItemSchema.safeParse(validItem).success).toBe(true);
    expect(insertPriceItemSchema.safeParse({ ...validItem, durationMin: 45 }).success).toBe(true);
    expect(insertPriceItemSchema.safeParse({ ...validItem, durationMin: null }).success).toBe(true);
  });

  it.each([
    [{ price: "forty" }, "ჩაწერეთ ფასი"],
    [{ price: 12.5 }, "ფასი მთელი რიცხვი უნდა იყოს"],
    [{ price: -1 }, "ფასი არ შეიძლება იყოს უარყოფითი"],
    [{ booking: "Haircut" }, "აირჩიეთ სერვისი"],
    [{ nameKa: "   " }, "ჩაწერეთ სახელი ქართულად"],
    [{ nameEn: "" }, "ჩაწერეთ სახელი ინგლისურად"],
    [{ groupId: "" }, "აირჩიეთ ჯგუფი"],
  ])("rejects %j with the Georgian message %j", (patch, message) => {
    expect(firstMessage(insertPriceItemSchema.safeParse({ ...validItem, ...patch }))).toBe(message);
  });

  it("rejects a zero or negative duration", () => {
    expect(insertPriceItemSchema.safeParse({ ...validItem, durationMin: 0 }).success).toBe(false);
  });
});

describe("price group", () => {
  it("trims and requires both languages", () => {
    const result = insertPriceGroupSchema.safeParse({
      titleKa: "  ლაზერი ",
      titleEn: "Laser",
      shortKa: "ლაზ.",
      shortEn: "",
    });
    expect(firstMessage(result)).toBe("ჩაწერეთ მოკლე სახელი ინგლისურად");
  });
});

describe("booking request", () => {
  const booking = {
    fullName: "ნინო",
    email: "nino@example.com",
    phone: "551287555",
    service: "Manicure",
    date: "2026-12-01",
    time: "12:00",
  };

  it("defaults duration and status when the client omits them", () => {
    const parsed = insertBookingSchema.parse(booking);
    expect(parsed.duration).toBe("90");
    expect(parsed.status).toBe("pending");
  });

  it("requires the customer's name", () => {
    const { fullName: _omit, ...rest } = booking;
    expect(insertBookingSchema.safeParse(rest).success).toBe(false);
  });
});

describe("chat request", () => {
  it("defaults the language to Georgian and needs at least one message", () => {
    expect(chatRequestSchema.parse({ messages: [{ role: "user", content: "hi" }] }).language).toBe("ka");
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });
});

describe("firstValidationMessage (API errors shown in the admin)", () => {
  it("returns the first issue's own (Georgian) message", () => {
    const result = insertPriceItemSchema.safeParse({ ...validItem, price: -1 });
    expect(result.success).toBe(false);
    expect(firstValidationMessage(result.error)).toBe("ფასი არ შეიძლება იყოს უარყოფითი");
  });

  it("falls back to a readable summary when an issue has no message", () => {
    const error = new z.ZodError([]);
    expect(firstValidationMessage(error)).toMatch(/validation/i);
  });

  it("returns null for errors that are not validation errors", () => {
    expect(firstValidationMessage(new Error("db down"))).toBeNull();
    expect(firstValidationMessage(undefined)).toBeNull();
  });
});
