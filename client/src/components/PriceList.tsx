import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight, X, ChevronDown, Share2 } from "lucide-react";
import type { Service } from "@shared/schema";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/SectionHeader";
import { hapticTap } from "@/lib/haptics";

type PriceListItem = {
  id: string;
  category: string;
  subtitle: string;
  items: Array<{ name: string; nameKa: string; price: number | string }>;
};

const staticPriceLists: PriceListItem[] = [
  {
    id: "nails",
    category: "ფრჩხილები",
    subtitle: "Nails — Manicure & Pedicure",
    items: [
      { name: "Gel Polish + Cuticle Care", nameKa: "გელ-ლაქი + კუტიკულის მოვლა", price: 35 },
      { name: "Gel Polish + Cuticle Removal", nameKa: "გელ-ლაქი + კუტიკულის მოცილება", price: 25 },
      { name: "Strengthening (Gel)", nameKa: "გამაგრება (გელი)", price: 45 },
      { name: "Extension", nameKa: "დაგრძელება", price: 80 },
      { name: "Correction", nameKa: "კორექცია", price: 70 },
      { name: "Gel Removal", nameKa: "გელის მოხსნა", price: 5 },
      { name: "Pedicure (Classic)", nameKa: "პედიკური (კლასიკური)", price: 40 },
      { name: "Pedicure (Gel Polish)", nameKa: "პედიკური (გელ-ლაქი)", price: 55 },
    ],
  },
  {
    id: "laser-women",
    category: "ლაზერი — ქალბატონები",
    subtitle: "Laser hair removal — Women",
    items: [
      { name: "Full Body (Economy Package)", nameKa: "მთელი სხეული (ეკონომ პაკეტი)", price: 75 },
      { name: "Full Body + Face", nameKa: "მთელი სხეული + სახე", price: 85 },
      { name: "Full Face", nameKa: "მთელი სახე", price: 20 },
      { name: "Full Legs", nameKa: "ფეხები (მთელი)", price: 30 },
      { name: "Full Arms", nameKa: "ხელები (მთელი)", price: 25 },
      { name: "Deep Bikini", nameKa: "ბიკინი (ღრმა)", price: 25 },
      { name: "Armpits", nameKa: "იღლიები", price: 10 },
    ],
  },
  {
    id: "laser-men",
    category: "ლაზერი — მამაკაცები",
    subtitle: "Laser hair removal — Men",
    items: [
      { name: "Full Body", nameKa: "მთელი სხეული", price: 75 },
      { name: "Full Back", nameKa: "ზურგი (მთელი)", price: 50 },
      { name: "Chest", nameKa: "მკერდი", price: 30 },
      { name: "Abdomen", nameKa: "მუცელი", price: 30 },
      { name: "Legs", nameKa: "ფეხები", price: 50 },
      { name: "Face / Beard Line", nameKa: "სახე / წვერის კონტური", price: 30 },
    ],
  },
  {
    id: "cosmetology",
    category: "კოსმეტოლოგია",
    subtitle: "Cosmetology — Skin & Injectables",
    items: [
      { name: "Juvederm Filler", nameKa: "ჯუვედერმ ფილერი", price: 500 },
      { name: "ReMedium Filler", nameKa: "რიმედიუმ ფილერი", price: 250 },
      { name: "Botox (NABOTA)", nameKa: "ბოტოქსი (NABOTA)", price: 250 },
      { name: "Biorevitalization", nameKa: "ბიორევიტალიზაცია", price: 100 },
      { name: "Mesotherapy", nameKa: "მეზოთერაპია", price: 100 },
      { name: "Face Peeling", nameKa: "სახის პილინგი", price: 100 },
    ],
  },
];

function scrollToBooking() {
  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function priceFromOf(cat: PriceListItem): number {
  return cat.items.reduce(
    (min, it) => (typeof it.price === "number" && it.price < min ? it.price : min),
    Infinity
  );
}

export default function PriceList() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const shareService = async (
    item: { name: string; nameKa: string; price: number | string },
    categoryLabel: string
  ) => {
    hapticTap();
    const url = `${window.location.origin}/#booking`;
    const text = `${item.nameKa} — ${item.price} ₾ · ${categoryLabel} · THE MR Studio`;
    try {
      await navigator.share({ title: "THE MR Studio", text, url });
    } catch {
      /* user cancelled or browser threw */
    }
  };

  // Keep server query alive for parity with the original; result is unused for layout.
  useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staticPriceLists
      .filter((cat) => activeFilter === "all" || cat.id === activeFilter)
      .map((cat) => {
        if (!q) return cat;
        return {
          ...cat,
          items: cat.items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              it.nameKa.toLowerCase().includes(q)
          ),
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [activeFilter, search]);

  // Auto-open behavior: if a chip narrows to a single category, open it.
  // If search has results, open the first matching category.
  useEffect(() => {
    if (activeFilter !== "all") {
      setOpenId(activeFilter);
      return;
    }
    if (search.trim() && filtered.length > 0) {
      setOpenId(filtered[0].id);
    }
  }, [activeFilter, search, filtered]);

  const filters: { id: string; label: string }[] = [
    { id: "all", label: "ყველა" },
    ...staticPriceLists.map((c) => ({ id: c.id, label: c.category.split(" — ")[0] })),
  ];

  return (
    <section id="prices" className="relative scroll-mt-24 bg-background pt-12 pb-14 md:scroll-mt-28 md:pt-20 md:pb-24">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <SectionHeader
          kicker="04 / Prices"
          title="ფასები"
          subtitle="გამჭვირვალე ფასები. გადახდა — ვიზიტის შემდეგ."
          align="center"
          className="mb-5 md:mb-8 mx-auto"
        />

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="მოძებნე სერვისი..."
            className="w-full h-12 pl-11 pr-10 rounded-[8px] bg-card/90 border border-border/80 focus:border-[var(--theme-accent)]/60 focus:outline-none text-sm placeholder:text-foreground/40 transition-colors shadow-sm"
            data-testid="prices-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="press-tap absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Segmented chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 md:mx-0 px-5 md:px-0 scrollbar-hide mb-5 md:mb-6">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  hapticTap();
                  setActiveFilter(f.id);
                }}
                className={cn(
                  "press-tap shrink-0 min-h-[34px] px-3.5 rounded-full text-xs font-medium tracking-normal transition-colors",
                  isActive
                    ? "bg-[var(--theme-accent)] text-[var(--theme-on-accent)]"
                    : "bg-secondary text-foreground/70 hover:text-foreground"
                )}
                data-testid={`price-filter-${f.id}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Collapsed accordion list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-foreground/50 text-sm">
              ვერაფერი მოიძებნა "{search}"
            </div>
          )}

          {filtered.map((cat) => {
            const isOpen = openId === cat.id;
            const fromPrice = priceFromOf(cat);
            return (
              <motion.div
                key={cat.id}
                id={`category-${cat.id}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4 }}
                className="scroll-mt-24 rounded-[8px] border border-border/80 bg-card/95 overflow-hidden shadow-[0_18px_60px_-52px_rgba(0,0,0,0.5)]"
              >
                {/* Category header — tap to expand */}
                <button
                  onClick={() => {
                    hapticTap();
                    setOpenId(isOpen ? null : cat.id);
                  }}
                  className="press-tap w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  aria-expanded={isOpen}
                  data-testid={`price-category-${cat.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display text-base md:text-lg tracking-normal text-foreground">
                        {cat.category}
                      </h3>
                      <span className="text-[10px] uppercase font-mono text-foreground/40">
                        {cat.items.length} სერვისი
                      </span>
                    </div>
                    {!isOpen && (
                      <p className="text-[11px] text-foreground/50 mt-0.5">
                        From {fromPrice} ₾ · {cat.subtitle}
                      </p>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-foreground/40"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="rows"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/60">
                        {cat.items.map((item, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-stretch transition-colors hover:bg-secondary/50",
                              i !== cat.items.length - 1 && "border-b border-border/60"
                            )}
                          >
                            <button
                              onClick={() => {
                                hapticTap();
                                scrollToBooking();
                              }}
                              className="press-tap flex-1 text-left flex items-center gap-3 px-4 py-3 min-w-0"
                              data-testid={`price-row-${cat.id}-${i}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-medium text-foreground truncate">
                                  {item.nameKa}
                                </div>
                                <div className="text-[11px] text-foreground/45 mt-0.5 truncate">
                                  {item.name}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-1 tabular-nums shrink-0">
                                <span className="text-sm font-medium text-foreground">
                                  {typeof item.price === "number" ? item.price : item.price}
                                </span>
                                <span className="text-[11px] text-foreground/50">₾</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
                            </button>
                            {canShare && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareService(item, cat.category);
                                }}
                                className="press-tap shrink-0 px-3 mr-1 my-1 rounded-xl text-foreground/40 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors flex items-center justify-center"
                                aria-label="Share service"
                                data-testid={`price-share-${cat.id}-${i}`}
                              >
                                <Share2 className="w-4 h-4" strokeWidth={1.6} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-foreground/40 mt-6 md:mt-8">
          * ყველა ფასი მითითებულია ლარში (₾). შეიძლება განსხვავდებოდეს.
        </p>
      </div>
    </section>
  );
}
