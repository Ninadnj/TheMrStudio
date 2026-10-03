/**
 * The studio menu. The owner edits it in the admin (Prices); the price list,
 * the services index and the booking sheet all read it from /api/price-menu.
 */
import { useQuery } from "@tanstack/react-query";
import type { PriceItem, PriceMenuGroup } from "@shared/schema";

export type BookingCategory = "Manicure" | "Pedicure" | "Epilation" | "Cosmetology";

/** The four bookable services, in display order. Icons are added where they're drawn. */
export const bookingCategories: { value: BookingCategory; labelKa: string; labelEn: string; hint: string }[] = [
  { value: "Manicure", labelKa: "მანიკური", labelEn: "Manicure", hint: "Manicure" },
  { value: "Pedicure", labelKa: "პედიკური", labelEn: "Pedicure", hint: "Pedicure" },
  { value: "Epilation", labelKa: "ლაზერული ეპილაცია", labelEn: "Laser hair removal", hint: "Laser" },
  { value: "Cosmetology", labelKa: "კოსმეტოლოგია", labelEn: "Cosmetology", hint: "Cosmetology" },
];

export type MenuGroup = PriceMenuGroup;
export type MenuItem = PriceItem;

export function usePriceMenu() {
  const { data, isLoading } = useQuery<MenuGroup[]>({ queryKey: ["/api/price-menu"] });
  return { menu: data ?? [], isLoading };
}

/** A menu item as the booking sheet lists it, with its group's short label. */
export type Treatment = MenuItem & {
  /** Stable key — names repeat across groups (e.g. "Full Body"). */
  key: string;
  name: string;
  groupKa: string;
  groupEn: string;
};

export function treatmentsFor(menu: MenuGroup[], category: string): Treatment[] {
  return menu.flatMap((group) =>
    group.items
      .filter((item) => item.booking === category)
      .map((item) => ({ ...item, key: item.id, name: item.nameEn, groupKa: group.shortKa, groupEn: group.shortEn }))
  );
}

/* ---------- "Book this" handoff from anywhere on the page ---------- */

export const BOOKING_REQUEST_EVENT = "mr:book";

export type BookingRequest = {
  category: BookingCategory;
  treatmentKey?: string;
};

/** Open the booking sheet, optionally with a service (and treatment) pre-selected. */
export function requestBooking(detail?: BookingRequest) {
  window.dispatchEvent(new CustomEvent<BookingRequest | undefined>(BOOKING_REQUEST_EVENT, { detail }));
}

/** Short, human-friendly reference derived from the stored booking id. */
export function bookingRef(id: string) {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}
