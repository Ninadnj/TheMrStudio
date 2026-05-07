import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { Activity, CalendarCheck, Hand, ReceiptText, ScanLine, type LucideIcon } from "lucide-react";
import type { ServicesSection } from "@shared/schema";
import SectionHeader from "@/components/SectionHeader";
import { hapticTap } from "@/lib/haptics";

type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceFrom: string;
  priceAnchor: string;
  Icon: LucideIcon;
};

const categories: Category[] = [
  {
    id: "nails",
    title: "ფრჩხილები",
    subtitle: "Nails",
    description: "მანიკური, პედიკური, გელ-ლაქი და დაგრძელება პრემიუმ მასალებით.",
    priceFrom: "5",
    priceAnchor: "category-nails",
    Icon: Hand,
  },
  {
    id: "laser",
    title: "ლაზერი",
    subtitle: "Laser",
    description: "უახლესი დიოდური ლაზერული ეპილაცია — სწრაფი და უსაფრთხო.",
    priceFrom: "10",
    priceAnchor: "category-laser-women",
    Icon: ScanLine,
  },
  {
    id: "cosmetology",
    title: "ესთეტიკა",
    subtitle: "Cosmetology",
    description: "ფილერი, ბოტოქსი, ბიორევიტალიზაცია, პილინგი და მეზოთერაპია.",
    priceFrom: "100",
    priceAnchor: "category-cosmetology",
    Icon: Activity,
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
    <section id="services" className="scroll-mt-24 py-14 md:scroll-mt-28 md:py-24 bg-background relative overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-5 md:px-12">
        <SectionHeader
          kicker="01 — Services"
          title="ჩვენი სერვისები"
          subtitle="აირჩიე კატეგორია, ნახე ფასები, დაჯავშნე."
          className="mb-6 md:mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.Icon;
            return (
              <motion.article
                key={cat.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="press-tap group relative min-h-[350px] overflow-hidden rounded-[8px] border border-border/80 bg-card/95 flex flex-col shadow-[0_24px_70px_-58px_rgba(0,0,0,0.58)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--theme-accent)]/35"
                data-testid={`service-card-${cat.id}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(191,207,187,0.32),transparent_32%),linear-gradient(145deg,rgba(247,250,246,0.98),rgba(191,207,187,0.18))]" />
                <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full border border-[var(--theme-accent)]/10" />
                <div className="absolute -left-20 bottom-14 h-48 w-48 rounded-full border border-[var(--theme-accent)]/10" />
                <Icon className="absolute right-1 top-24 h-24 w-24 text-[var(--theme-accent)] opacity-[0.08] transition-transform duration-500 group-hover:scale-105" strokeWidth={1} />

                <div className="relative flex flex-1 flex-col p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-full border border-[var(--theme-accent)]/18 bg-white/45 px-3 py-1 text-[10px] uppercase font-mono text-foreground/62 backdrop-blur-sm">
                      {cat.subtitle}
                    </div>
                    <div className="text-[11px] font-mono text-foreground/34">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--theme-accent)]/18 bg-white/40 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.03]">
                      <div className="absolute inset-2 rounded-full border border-[var(--theme-accent)]/10" />
                      <Icon className="relative h-7 w-7 text-[var(--theme-accent)]" strokeWidth={1.35} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-3xl md:text-4xl tracking-normal uppercase leading-none text-foreground">
                      {cat.title}
                    </h3>
                    <p className="mt-3 min-h-[60px] text-sm leading-relaxed text-foreground/62">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between rounded-[8px] border border-border/70 bg-secondary/32 px-3.5 py-2.5">
                    <span className="text-[11px] uppercase font-mono text-foreground/48">
                      From
                    </span>
                    <span className="text-lg font-medium tabular-nums text-foreground">
                      {cat.priceFrom} ₾
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        hapticTap();
                        scrollToId(cat.priceAnchor);
                      }}
                      className="press-tap inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border/80 bg-background/60 text-xs font-medium text-foreground/75 transition-colors hover:border-[var(--theme-accent)]/40 hover:text-foreground"
                      data-testid={`service-prices-${cat.id}`}
                      aria-label={`View ${cat.subtitle} prices`}
                    >
                      <ReceiptText className="w-3.5 h-3.5" strokeWidth={1.7} />
                      ფასები
                    </button>
                    <button
                      onClick={() => {
                        hapticTap();
                        scrollToId("booking");
                      }}
                      className="press-tap accent-glow inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] text-xs font-medium text-[var(--theme-on-accent)] transition-colors hover:bg-[var(--theme-accent-hover)]"
                      data-testid={`service-book-${cat.id}`}
                      aria-label={`Book ${cat.subtitle}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.8} />
                      დაჯავშნა
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
