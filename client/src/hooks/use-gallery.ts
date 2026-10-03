import { useQuery } from "@tanstack/react-query";
import type { GalleryImage } from "@shared/schema";

/**
 * Local development runs on in-memory sample data with an empty gallery.
 * In dev only, fall back to the studio's published photos so layouts can be
 * designed against real imagery. Never used in production builds.
 */
const DEV_GALLERY: GalleryImage[] = [
  ["ფრჩხილები", "v1772222652/the-mr-studio-uploads/1772222650841-527708820.jpg"],
  ["ფრჩხილები", "v1772222685/the-mr-studio-uploads/1772222682045-161519237.jpg"],
  ["ლაზერი", "v1772225594/the-mr-studio-uploads/1772225594014-458298389.jpg"],
  ["ფრჩხილები", "v1772225632/the-mr-studio-uploads/1772225631370-370280296.jpg"],
  ["ფრჩხილები", "v1772225753/the-mr-studio-uploads/1772225752827-608105742.jpg"],
  ["ლაზერი", "v1772226480/the-mr-studio-uploads/1772226476295-715099448.jpg"],
  ["ფრჩხილები", "v1772227121/the-mr-studio-uploads/1772227120536-551132651.jpg"],
].map(([category, path], i) => ({
  id: `dev-${i}`,
  category,
  imageUrl: `https://res.cloudinary.com/dinowk95m/image/upload/${path}`,
  order: String(i + 1),
}));

export function useGalleryImages() {
  const query = useQuery<GalleryImage[]>({ queryKey: ["/api/gallery"] });
  const data = query.data ?? [];
  if (import.meta.env.DEV && query.isSuccess && data.length === 0) {
    return { ...query, data: DEV_GALLERY };
  }
  return { ...query, data };
}
