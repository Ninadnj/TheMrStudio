import { insertStudioInfoSchema } from "@shared/schema";
import { defaultStudioInfo } from "@shared/studioDefaults";
import { describe, expect, it } from "vitest";
import { toStudio } from "@/lib/studio";

const base = { ...defaultStudioInfo };

describe("toStudio", () => {
  it("adds the Georgian country code to a 9-digit local mobile for tel: and WhatsApp", () => {
    const studio = toStudio({ ...base, phone: "551 287 555" });
    expect(studio.phone).toEqual({ display: "551 287 555", href: "tel:+995551287555" });
    expect(studio.whatsappLink("hi")).toBe("https://wa.me/995551287555?text=hi");
  });

  it("keeps an international number as is", () => {
    expect(toStudio({ ...base, phone: "+995 551 287 555" }).phone.href).toBe("tel:+995551287555");
  });

  it("URL-encodes the map query and the WhatsApp message (Georgian text)", () => {
    const studio = toStudio({ ...base, mapQuery: "ვეფხისტყაოსნის 20/22" });
    expect(studio.mapUrl).toBe(`https://maps.google.com/?q=${encodeURIComponent("ვეფხისტყაოსნის 20/22")}`);
    expect(studio.mapEmbedUrl).toContain("output=embed");
    expect(studio.whatsappLink("გამარჯობა & hi")).toContain(encodeURIComponent("გამარჯობა & hi"));
  });

  it("hides opening hours until the owner fills them in", () => {
    expect(toStudio({ ...base, hoursKa: "", hoursEn: "  " }).hours).toBeNull();
  });

  it("falls back to the other language when only one hours field is filled", () => {
    expect(toStudio({ ...base, hoursKa: "", hoursEn: "10–20" }).hours).toEqual({ ka: "10–20", en: "10–20" });
    expect(toStudio({ ...base, hoursKa: "10–20", hoursEn: "" }).hours).toEqual({ ka: "10–20", en: "10–20" });
  });

  it("turns blank social links into null so the footer can hide them", () => {
    const studio = toStudio({ ...base, instagram: " ", facebook: "" });
    expect(studio.instagram).toBeNull();
    expect(studio.facebook).toBeNull();
  });
});

describe("studio info validation (admin Settings form)", () => {
  it("accepts the launch defaults", () => {
    expect(insertStudioInfoSchema.safeParse(defaultStudioInfo).success).toBe(true);
  });

  it.each([
    ["email", "not-an-email"],
    ["phone", "   "],
    ["addressKa", ""],
    ["instagram", "instagram.com/studio"],
  ])("rejects an invalid %s", (field, value) => {
    expect(insertStudioInfoSchema.safeParse({ ...defaultStudioInfo, [field]: value }).success).toBe(false);
  });

  it("allows social links to be cleared", () => {
    expect(insertStudioInfoSchema.safeParse({ ...defaultStudioInfo, instagram: "" }).success).toBe(true);
  });
});
