import type { GalleryImage } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { BeamIcon, DropIcon, PolishIcon } from "@/components/StudioIcons";
import { useGalleryImages } from "@/hooks/use-gallery";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { scrollBehavior } from "@/lib/motion";
import { stagger } from "@/lib/reveal";
import { type BookingCategory, type MenuGroup, serviceStats, usePriceMenu } from "@/lib/serviceMenu";
import { isVideoUrl } from "@/lib/videoUtils";

type Category = {
  id: string;
  titleKa: string;
  titleEn: string;
  subtitleKa: string;
  subtitleEn: string;
  /** Bookable services in this category — its treatments are counted and its menu group is the scroll target. */
  bookings: BookingCategory[];
  matchKeywords: string[];
  icon: ReactNode;
};

const categories: Category[] = [
  {
    id: "nails",
    titleKa: "ფრჩხილები",
    titleEn: "Nails",
    subtitleKa: "მანიკური · პედიკური",
    subtitleEn: "Manicure · Pedicure",
    bookings: ["Manicure", "Pedicure"],
    matchKeywords: ["nail", "manicure", "pedicure", "gel", "ფრჩხ", "მანიკ", "პედიკ"],
    icon: <PolishIcon />,
  },
  {
    id: "laser",
    titleKa: "ლაზერი",
    titleEn: "Laser",
    subtitleKa: "ეპილაცია",
    subtitleEn: "Hair removal",
    bookings: ["Epilation"],
    matchKeywords: ["laser", "epilation", "ლაზერ", "ეპილ"],
    icon: <BeamIcon />,
  },
  {
    id: "cosmetology",
    titleKa: "ესთეტიკა",
    titleEn: "Aesthetics",
    subtitleKa: "კოსმეტოლოგია",
    subtitleEn: "Cosmetology",
    bookings: ["Cosmetology"],
    matchKeywords: ["cosmet", "skin", "face", "filler", "botox", "კოსმეტ", "ესთეტ", "სახ"],
    icon: <DropIcon />,
  },
];

const inCategory = (cat: Category) => (item: { booking: string }) =>
  cat.bookings.includes(item.booking as BookingCategory);

function showInMenu(menu: MenuGroup[], cat: Category) {
  const group = menu.find((g) => g.items.some(inCategory(cat)));
  const target = group ? document.getElementById(`category-${group.id}`) : document.getElementById("prices");
  target?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

function Media({ image, alt }: { image: GalleryImage; alt: string }) {
  return isVideoUrl(image.imageUrl) ? (
    <video src={image.imageUrl} autoPlay loop muted playsInline aria-hidden className="h-full w-full object-cover" />
  ) : (
    <img src={image.imageUrl} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
  );
}

export default function Services() {
  const { t } = useLang();
  const { data: galleryImages } = useGalleryImages();
  const { menu } = usePriceMenu();

  const imageByCategory = useMemo(() => {
    const map = new Map<string, GalleryImage>();
    for (const cat of categories) {
      const match = galleryImages.find((img) =>
        cat.matchKeywords.some((kw) => img.category.toLowerCase().includes(kw.toLowerCase())),
      );
      if (match) map.set(cat.id, match);
    }
    return map;
  }, [galleryImages]);

  const statsFor = (cat: Category) => serviceStats(menu, cat.bookings);
  const fromLabel = (from: number | null) => (from === null ? null : t(`${from} ₾-დან`, `from ${from} ₾`));

  return (
    <section id="services" className="section scroll-mt-20 md:scroll-mt-24" aria-labelledby="services-title">
      <div className="shell">
        <div className="section-head services-head">
          <div className="section-head">
            <p className="eyebrow" data-reveal="rise">
              {t("სტუდია", "The studio")}
            </p>
            <h2 id="services-title" className="display section-title" data-reveal="mask">
              <span>{t("სერვისები", "Services")}</span>
            </h2>
          </div>
          {/* biome-ignore lint/a11y/useValidAnchor: a real in-page link (works without JS); the handler only smooths the scroll */}
          <a
            href="#prices"
            className="link-line services-all-prices"
            onClick={(e) => {
              e.preventDefault();
              hapticTap();
              document.getElementById("prices")?.scrollIntoView({ behavior: scrollBehavior() });
            }}
            data-testid="services-all-prices"
          >
            {t("ყველა ფასი", "All prices")}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>

        {/* Desktop: three tall panels — photo (or the framed seal), number, name, starting price */}
        <ol className="service-panels">
          {categories.map((cat, i) => {
            const image = imageByCategory.get(cat.id);
            const { count, from } = statsFor(cat);
            return (
              <li key={cat.id} data-reveal="rise" style={stagger(i)}>
                <button
                  type="button"
                  className="service-panel"
                  data-photo={!!image || undefined}
                  onClick={() => {
                    hapticTap();
                    showInMenu(menu, cat);
                  }}
                  data-testid={`service-card-${cat.id}`}
                >
                  <span className="service-panel-media" aria-hidden>
                    {image ? (
                      <Media image={image} alt="" />
                    ) : (
                      <span className="studio-seal service-panel-seal">{cat.icon}</span>
                    )}
                  </span>
                  <span className="service-panel-head">
                    <span className="service-panel-num">0{i + 1}</span>
                    <span className="service-panel-title display">{t(cat.titleKa, cat.titleEn)}</span>
                    {from !== null && <span className="service-panel-price">{fromLabel(from)}</span>}
                  </span>
                  <span className="service-panel-meta">
                    {t(cat.subtitleKa, cat.subtitleEn)} · {count} {t("პროცედურა", "treatments")}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Phones and tablets: full-width tiles with the title over the photo */}
        <div className="service-tiles">
          {categories.map((cat, i) => {
            const image = imageByCategory.get(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className="service-tile press-tap"
                data-reveal="unveil"
                style={stagger(i)}
                data-photo={!!image || undefined}
                onClick={() => {
                  hapticTap();
                  showInMenu(menu, cat);
                }}
                data-testid={`service-tile-${cat.id}`}
              >
                <span className="service-tile-media" aria-hidden>
                  {image ? (
                    <Media image={image} alt="" />
                  ) : (
                    <span className="studio-seal service-tile-seal">{cat.icon}</span>
                  )}
                </span>
                <span className="service-tile-text">
                  <span className="service-tile-num">0{i + 1}</span>
                  <span className="service-tile-title display">{t(cat.titleKa, cat.titleEn)}</span>
                  <span className="service-tile-meta">
                    {t(cat.subtitleKa, cat.subtitleEn)} · {statsFor(cat).count} {t("პროცედურა", "treatments")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
