import { useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { GalleryImage } from "@shared/schema";
import { PolishIcon, BeamIcon, DropIcon } from "@/components/StudioIcons";
import { hapticTap } from "@/lib/haptics";
import { isVideoUrl } from "@/lib/videoUtils";
import { useLang } from "@/lib/i18n";
import { usePriceMenu, type BookingCategory, type MenuGroup } from "@/lib/serviceMenu";
import { scrollBehavior } from "@/lib/motion";
import { stagger } from "@/lib/reveal";
import { useGalleryImages } from "@/hooks/use-gallery";

type Category = {
  id: string;
  titleKa: string;
  titleEn: string;
  subtitleKa: string;
  subtitleEn: string;
  descriptionKa: string;
  descriptionEn: string;
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
    descriptionKa: "მანიკური, პედიკური, გელ-ლაქი და დაგრძელება პრემიუმ მასალებით.",
    descriptionEn: "Manicure, pedicure, gel polish and extensions in premium materials.",
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
    descriptionKa: "უახლესი დიოდური ლაზერული ეპილაცია — სწრაფი და უსაფრთხო.",
    descriptionEn: "Latest-generation diode laser hair removal, fast and gentle.",
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
    descriptionKa: "ფილერი, ბოტოქსი, ბიორევიტალიზაცია, პილინგი და მეზოთერაპია.",
    descriptionEn: "Filler, botox, biorevitalization, peeling and mesotherapy.",
    bookings: ["Cosmetology"],
    matchKeywords: ["cosmet", "skin", "face", "filler", "botox", "კოსმეტ", "ესთეტ", "სახ"],
    icon: <DropIcon />,
  },
];

const inCategory = (cat: Category) => (item: { booking: string }) => cat.bookings.includes(item.booking as BookingCategory);

function treatmentCount(menu: MenuGroup[], cat: Category) {
  return menu.reduce((sum, group) => sum + group.items.filter(inCategory(cat)).length, 0);
}

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
  const indexRef = useRef<HTMLOListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const imageByCategory = useMemo(() => {
    const map = new Map<string, GalleryImage>();
    for (const cat of categories) {
      const match = galleryImages.find((img) =>
        cat.matchKeywords.some((kw) => img.category.toLowerCase().includes(kw.toLowerCase()))
      );
      if (match) map.set(cat.id, match);
    }
    return map;
  }, [galleryImages]);

  const hoveredImage = hovered !== null ? imageByCategory.get(categories[hovered].id) : undefined;

  return (
    <section id="services" className="section scroll-mt-20 md:scroll-mt-24" aria-labelledby="services-title">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow" data-reveal="rise">{t("სტუდია", "The studio")}</p>
          <h2 id="services-title" className="display section-title" data-reveal="mask">
            <span>{t("სერვისები", "Services")}</span>
          </h2>
        </div>

        {/* Desktop: editorial index — numbered rows, a photo follows the pointer */}
        <ol
          ref={indexRef}
          className="service-index"
          onMouseMove={(e) => {
            const box = indexRef.current?.getBoundingClientRect();
            if (box) setPointer({ x: e.clientX - box.left, y: e.clientY - box.top });
          }}
          onMouseLeave={() => setHovered(null)}
        >
          {categories.map((cat, i) => (
            <li key={cat.id} data-reveal="rise" style={stagger(i)}>
              <button
                type="button"
                className="service-row"
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                onClick={() => {
                  hapticTap();
                  showInMenu(menu, cat);
                }}
                data-testid={`service-card-${cat.id}`}
              >
                <span className="service-row-num" aria-hidden>
                  0{i + 1}
                </span>
                <span className="service-row-title display">{t(cat.titleKa, cat.titleEn)}</span>
                <span className="service-row-copy">
                  <span className="service-row-sub">{t(cat.subtitleKa, cat.subtitleEn)}</span>
                  <span>{t(cat.descriptionKa, cat.descriptionEn)}</span>
                </span>
                <span className="service-row-meta">
                  {treatmentCount(menu, cat)} {t("პროცედურა", "treatments")}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </span>
              </button>
            </li>
          ))}

          <li aria-hidden className="service-float-slot">
            <figure
              className="service-float"
              data-visible={!!hoveredImage || undefined}
              style={{ transform: `translate3d(${pointer.x}px, ${pointer.y}px, 0)` }}
            >
              {hoveredImage && <Media key={hoveredImage.id} image={hoveredImage} alt="" />}
            </figure>
          </li>
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
                  {image ? <Media image={image} alt="" /> : <span className="studio-seal service-tile-seal">{cat.icon}</span>}
                </span>
                <span className="service-tile-text">
                  <span className="service-tile-num">0{i + 1}</span>
                  <span className="service-tile-title display">{t(cat.titleKa, cat.titleEn)}</span>
                  <span className="service-tile-meta">
                    {t(cat.subtitleKa, cat.subtitleEn)} · {treatmentCount(menu, cat)} {t("პროცედურა", "treatments")}
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
