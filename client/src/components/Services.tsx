import { useRef, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ServicesSection, GalleryImage } from "@shared/schema";
import SectionHeader from "@/components/SectionHeader";
import { hapticTap } from "@/lib/haptics";
import { isVideoUrl } from "@/lib/videoUtils";
import { useLang } from "@/lib/i18n";

/* ─── Hairline marks — minimal abstract symbols per category ─── */

const NailMark = (
  <svg viewBox="0 0 56 72" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" aria-hidden>
    {/* almond / nail silhouette */}
    <path d="M28 8 C 14 14, 14 50, 28 64 C 42 50, 42 14, 28 8 Z" />
    <path d="M22 22 C 26 18, 30 18, 34 22" opacity="0.5" />
  </svg>
);

const LaserMark = (
  <svg viewBox="0 0 56 72" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" aria-hidden>
    {/* vertical beam with diffraction marks */}
    <line x1="28" y1="6" x2="28" y2="66" />
    <line x1="18" y1="22" x2="38" y2="22" opacity="0.55" />
    <line x1="14" y1="38" x2="42" y2="38" opacity="0.85" />
    <line x1="18" y1="54" x2="38" y2="54" opacity="0.55" />
    <circle cx="28" cy="38" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

const AestheticsMark = (
  <svg viewBox="0 0 56 72" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" aria-hidden>
    {/* concentric circles — soft mirror/lens */}
    <circle cx="28" cy="36" r="20" />
    <circle cx="28" cy="36" r="12" opacity="0.55" />
    <circle cx="28" cy="36" r="3" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

type Category = {
  id: string;
  titleKa: string;
  titleEn: string;
  subtitleKa: string;
  subtitleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  count: number;
  priceAnchor: string;
  matchKeywords: string[];
  mark: ReactNode;
};

const categories: Category[] = [
  {
    id: "nails",
    titleKa: "ფრჩხილები",
    titleEn: "Nails",
    subtitleKa: "მანიკური · პედიკური",
    subtitleEn: "Manicure · Pedicure",
    descriptionKa: "მანიკური, პედიკური, გელ-ლაქი და დაგრძელება პრემიუმ მასალებით.",
    descriptionEn: "Manicure, pedicure, gel polish, and extensions in premium materials.",
    count: 8,
    priceAnchor: "category-nails",
    matchKeywords: ["nail", "manicure", "pedicure", "gel", "ფრჩხ", "მანიკ", "პედიკ"],
    mark: NailMark,
  },
  {
    id: "laser",
    titleKa: "ლაზერი",
    titleEn: "Laser",
    subtitleKa: "ეპილაცია",
    subtitleEn: "Hair removal",
    descriptionKa: "უახლესი დიოდური ლაზერული ეპილაცია — სწრაფი და უსაფრთხო.",
    descriptionEn: "Latest-generation diode laser hair removal — fast and gentle.",
    count: 13,
    priceAnchor: "category-laser-women",
    matchKeywords: ["laser", "epilation", "ლაზერ", "ეპილ"],
    mark: LaserMark,
  },
  {
    id: "cosmetology",
    titleKa: "ესთეტიკა",
    titleEn: "Aesthetics",
    subtitleKa: "კოსმეტოლოგია",
    subtitleEn: "Cosmetology",
    descriptionKa: "ფილერი, ბოტოქსი, ბიორევიტალიზაცია, პილინგი და მეზოთერაპია.",
    descriptionEn: "Filler, botox, biorevitalization, peeling, and mesotherapy.",
    count: 6,
    priceAnchor: "category-cosmetology",
    matchKeywords: ["cosmet", "skin", "face", "filler", "botox", "კოსმეტ", "ესთეტ", "სახ"],
    mark: AestheticsMark,
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Services() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { t } = useLang();

  useQuery<ServicesSection>({
    queryKey: ["/api/services-section"],
  });

  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const thumbnailByCategory = useMemo(() => {
    const map = new Map<string, GalleryImage>();
    for (const cat of categories) {
      const match = galleryImages.find((img) => {
        const haystack = `${img.category}`.toLowerCase();
        return cat.matchKeywords.some((kw) => haystack.includes(kw.toLowerCase()));
      });
      if (match) map.set(cat.id, match);
    }
    return map;
  }, [galleryImages]);

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      id="services"
      className="scroll-mt-20 app-section md:scroll-mt-24"
      ref={sectionRef}
    >
      <div className="app-shell">
        <SectionHeader
          kicker={t("Studio menu", "Studio menu")}
          title={t("სერვისები", "Services")}
          subtitle={t(
            "ზუსტი კატეგორიები სწრაფი არჩევისთვის.",
            "Precise categories for a faster choice."
          )}
          className="mb-5 md:mb-7"
        />

        <div className="services-card-stack">
          {categories.map((cat, i) => {
            const thumb = thumbnailByCategory.get(cat.id);
            const thumbIsVideo = thumb ? isVideoUrl(thumb.imageUrl) : false;
            return (
              <motion.button
                key={cat.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                onClick={() => {
                  hapticTap();
                  scrollToId(cat.priceAnchor);
                }}
                className="service-card press-tap group"
                data-testid={`service-card-${cat.id}`}
                aria-label={`Open ${cat.subtitleEn} prices`}
              >
                <span className="service-card-index" aria-hidden>
                  0{i + 1}
                </span>

                {/* Editorial portrait thumbnail (only when a real photo exists) */}
                {thumb && (
                  <div className="service-card-media editorial-grain">
                    {thumbIsVideo ? (
                      <video
                        src={thumb.imageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={thumb.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}

                {/* Mark rail (when no photo) — hairline abstract symbol */}
                {!thumb && (
                  <div className="service-card-rail">
                    <div className="service-card-mark">
                      {cat.mark}
                    </div>
                  </div>
                )}

                {/* Content column */}
                <div className="service-card-body">
                  <div className="min-w-0 pr-8">
                    <p className="service-card-kicker">{t(cat.subtitleKa, cat.subtitleEn)}</p>
                    <h3 className="service-card-title">
                      {t(cat.titleKa, cat.titleEn)}
                    </h3>
                    <p className="service-card-copy">
                      {t(cat.descriptionKa, cat.descriptionEn)}
                    </p>
                  </div>

                  <div className="service-card-footer">
                    <span className="service-card-count">
                      {cat.count} {t("სერვისი", "services")}
                    </span>
                    <span className="service-card-arrow" aria-hidden>
                      <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
