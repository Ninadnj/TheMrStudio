import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { InsertStudioInfo } from "@shared/schema";
import { defaultStudioInfo } from "@shared/studioDefaults";

/** Studio contact details as the site uses them — the owner edits them in the admin (Settings). */
export type Studio = ReturnType<typeof toStudio>;

export function toStudio(info: InsertStudioInfo) {
  const digits = info.phone.replace(/\D/g, "");
  // Georgian mobiles are often typed without the country code
  const whatsappNumber = digits.length === 9 ? `995${digits}` : digits;
  const mapQuery = encodeURIComponent(info.mapQuery);
  const hoursKa = info.hoursKa?.trim() ?? "";
  const hoursEn = info.hoursEn?.trim() ?? "";
  return {
    address: { ka: info.addressKa, en: info.addressEn },
    mapUrl: `https://maps.google.com/?q=${mapQuery}`,
    mapEmbedUrl: `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    phone: { display: info.phone, href: `tel:+${whatsappNumber}` },
    email: info.email,
    instagram: info.instagram?.trim() || null,
    facebook: info.facebook?.trim() || null,
    /** Hidden while the owner hasn't filled it in. */
    hours: hoursKa || hoursEn ? { ka: hoursKa || hoursEn, en: hoursEn || hoursKa } : null,
    whatsappLink: (message: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
  };
}

const fallback = toStudio(defaultStudioInfo);

/** The studio's details: the launch defaults at first, then whatever the owner saved. */
export function useStudio(): Studio {
  const { data } = useQuery<InsertStudioInfo>({ queryKey: ["/api/studio-info"] });
  return useMemo(() => (data ? toStudio(data) : fallback), [data]);
}
