// DatabaseStorage against a real Postgres engine (PGlite, in-process): proves the Drizzle
// queries, the self-migrating ensureContent() and the UTC+4 offer rule on actual SQL.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../server/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const schema = await import("@shared/schema");
  return { db: drizzle(new PGlite(), { schema }) };
});

const schema = await import("@shared/schema");
const { db } = (await import("../../server/db")) as unknown as { db: Parameters<typeof pushSchema>[1] };
const { pushSchema } = await import("drizzle-kit/api");
const { DatabaseStorage } = await import("../../server/storage");
const { seedPriceMenu } = await import("../../server/seed-content");

const storage = new DatabaseStorage();

beforeAll(async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  // Tables that production got from the original setup; content tables come from ensureContent().
  const contentTables = ["priceGroups", "priceItems", "studioInfo"];
  const baseTables = Object.fromEntries(Object.entries(schema).filter(([name]) => !contentTables.includes(name)));
  const { apply } = await pushSchema(baseTables, db);
  await apply();
  await storage.ensureContent();
}, 60_000);

afterAll(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ensureContent (runs on every server start)", () => {
  it("creates and seeds the price menu and studio info", async () => {
    const menu = await storage.getPriceMenu();
    expect(menu).toHaveLength(seedPriceMenu.length);
    const seededItems = seedPriceMenu.reduce((n, g) => n + g.items.length, 0);
    expect(menu.reduce((n, g) => n + g.items.length, 0)).toBe(seededItems);
    expect((await storage.getStudioInfo()).phone).not.toBe("");
  });

  it("is idempotent: a restart neither duplicates nor overwrites the owner's edits", async () => {
    const info = await storage.getStudioInfo();
    await storage.updateStudioInfo({ ...info, phone: "+995 555 000 000" });
    await storage.ensureContent();
    expect((await storage.getPriceMenu()).length).toBe(seedPriceMenu.length);
    expect((await storage.getStudioInfo()).phone).toBe("+995 555 000 000");
  });
});

describe("price menu", () => {
  it("returns groups and items in display order and appends new items at the end", async () => {
    const [first] = await storage.getPriceMenu();
    const created = await storage.createPriceItem({
      groupId: first.id,
      nameKa: "ტესტი",
      nameEn: "Test",
      price: 5,
      booking: "Manicure",
    });
    const group = (await storage.getPriceMenu()).find((g) => g.id === first.id);
    const positions = group?.items.map((i) => i.position) ?? [];
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(group?.items.at(-1)?.id).toBe(created.id);

    const updated = await storage.updatePriceItem(created.id, { price: 7 });
    expect(updated?.price).toBe(7);
  });
});

describe("bookings", () => {
  it("stores a request as pending with the default duration and finds it by date", async () => {
    const booking = await storage.createBooking({
      fullName: "ნინო",
      email: "nino@example.com",
      phone: "551287555",
      service: "Manicure",
      date: "2026-12-01",
      time: "12:00",
    } as Parameters<typeof storage.createBooking>[0]);
    expect(booking.status).toBe("pending");
    expect(booking.duration).toBe("90");
    expect((await storage.getBookingsByDate("2026-12-01")).map((b) => b.id)).toContain(booking.id);
  });
});

describe("special offer (runs through its whole expiry day, Tbilisi time)", () => {
  it.each([
    ["2026-12-01T19:59:00Z", true], // 23:59 in Tbilisi on the expiry day
    ["2026-12-01T20:00:00Z", false], // 00:00 the next day in Tbilisi
  ])("at %s it is shown: %s", async (now, shown) => {
    await db.delete(schema.specialOffers);
    await storage.createSpecialOffer({ message: "−20%", isActive: true, expiryDate: "2026-12-01" });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(now));
    expect(Boolean(await storage.getActiveSpecialOffer())).toBe(shown);
    vi.useRealTimers();
  });
});
