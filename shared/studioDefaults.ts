import type { InsertStudioInfo } from "./schema";

/**
 * The studio details the site launched with. The server seeds the admin-editable
 * record from these; the site shows them until that record has loaded.
 */
export const defaultStudioInfo = {
  phone: "+995 551 287 555",
  email: "Studiomrmr1@gmail.com",
  addressKa: "დიდი დიღომი, ვეფხისტყაოსნის 22/24, თბილისი",
  addressEn: "Didi Dighomi, Vepkhistkaosani 22/24, Tbilisi",
  // The pin the site has always used (see git: "restore original map location")
  mapQuery: "ვეფხისტყაოსნის 20/22, თბილისი",
  hoursKa: "",
  hoursEn: "",
  instagram: "https://www.instagram.com/studiomariamisnail?igsh=N3RvYTE3dXBnZ29v&utm_source=qr",
  facebook: "https://www.facebook.com/profile.php?id=61566420489825"
} satisfies Required<InsertStudioInfo>;
