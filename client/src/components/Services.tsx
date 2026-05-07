import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ServicesSection } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";
import SectionHeader from "@/components/SectionHeader";
import { hapticTap } from "@/lib/haptics";

type Category = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  priceFrom: string;
  priceAnchor: string;
};

const categories: Category[] = [
  {
    id: "nails",
    title: "ფრჩხილები",
    subtitle: "Nails",
    image: "/assets/services/nails.png",
    description: "მანიკური, პედიკური, გელ-ლაქი და დაგრძელება პრემიუმ მასალებით.",
    priceFrom: "5",
    priceAnchor: "category-nails",
  },
  {
    id: "laser",
    title: "ლაზერი",
    subtitle: "Laser",
    image: "/assets/services/laser.png",
    description: "უახლესი დიოდური ლაზერული ეპილაცია — სწრაფი და უსაფრთხო.",
    priceFrom: "10",
    priceAnchor: "category-laser-women",
  },
  {
    id: "cosmetology",
    title: "ესთეტიკა",
    subtitle: "Cosmetology",
    image: "/assets/services/cosmetology.png",
    description: "ფილერი, ბოტოქსი, ბიორევიტალიზაცია, პილინგი და მეზოთერაპია.",
    priceFrom: "100",
    priceAnchor: "category-cosmetology",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Services() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Keep the existing query for server-driven section content.
  useQuery<ServicesSection>({
    queryKey: ["/api/services-section"],
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section id="services" className="py-10 md:py-24 bg-background relative overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-5 md:px-12">
        <SectionHeader
          kicker="01 — Services"
          title="ჩვენი სერვისები"
          subtitle="აირჩიე კატეგორია, ნახე ფასები, დაჯავშნე."
          className="mb-6 md:mb-12"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {categories.map((cat, i) => {
            const isVideo = isVideoUrl(cat.image);
            return (
              <motion.article
                key={cat.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="press-tap group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card flex flex-col"
                data-testid={`service-card-${cat.id}`}
              >
                {/* Media */}
                <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-muted">
                  {isVideo ? (
                    <video
                      src={cat.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Floating chip */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 ios-glass px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] tracking-[0.18em] uppercase font-mono">
                    {cat.subtitle}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
                    <h3 className="font-display text-lg md:text-3xl text-[var(--theme-cream)] tracking-tight uppercase leading-none">
                      {cat.title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1 text-[var(--theme-cream)]/80">
                      <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-mono opacity-70">From</span>
                      <span className="text-xs md:text-sm font-medium tabular-nums">{cat.priceFrom} ₾</span>
                    </div>
                  </div>
                </div>

                {/* Body — actions only on this compact card */}
                <div className="p-3 md:p-5 flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      hapticTap();
                      scrollToId(cat.priceAnchor);
                    }}
                    className="press-tap flex-1 min-h-[38px] md:min-h-[40px] rounded-full text-[11px] md:text-xs font-medium text-foreground/80 hover:text-foreground bg-secondary/70 transition-colors"
                    data-testid={`service-prices-${cat.id}`}
                    aria-label={`View ${cat.subtitle} prices`}
                  >
                    ფასები
                  </button>
                  <button
                    onClick={() => {
                      hapticTap();
                      scrollToId("booking");
                    }}
                    className="press-tap accent-glow flex-1 min-h-[38px] md:min-h-[40px] rounded-full text-[11px] md:text-xs font-medium bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] inline-flex items-center justify-center gap-1 transition-colors"
                    data-testid={`service-book-${cat.id}`}
                    aria-label={`Book ${cat.subtitle}`}
                  >
                    დაჯავშნა
                    <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
