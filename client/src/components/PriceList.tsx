import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight, X, ChevronDown } from "lucide-react";
import type { Service } from "@shared/schema";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/SectionHeader";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

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
  const { t, lang } = useLang();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Keep server query alive for parity with the original.
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
    { id: "all", label: t("ყველა", "All") },
    ...staticPriceLists.map((c) => ({
      id: c.id,
      label: lang === "ka" ? c.category.split(" — ")[0] : c.subtitle.split(" — ")[0],
    })),
  ];

  return (
    <section
      id="prices"
      className="relative scroll-mt-20 app-section md:scroll-mt-24"
    >
      <div className="app-shell">
        <SectionHeader
          title={t("ფასები", "Prices")}
          subtitle={t(
            "გადახდა ვიზიტის შემდეგ.",
            "Payment after your visit."
          )}
          className="mb-5"
        />

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-muted1)]/60" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("მოძებნე სერვისი...", "Search a service…")}
            className="ios-input pl-10 pr-10"
            data-testid="prices-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="press-tap absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--theme-muted1)] hover:text-[var(--theme-text)]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide mb-4">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  hapticTap();
                  setActiveFilter(f.id);
                }}
                className="ios-chip"
                data-active={isActive}
                data-testid={`price-filter-${f.id}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Category groups (iOS grouped list) */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--theme-muted1)] text-sm">
              {t(`ვერაფერი მოიძებნა "${search}"`, `No results for "${search}"`)}
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
                className="scroll-mt-20"
              >
                <button
                  onClick={() => {
                    hapticTap();
                    setOpenId(isOpen ? null : cat.id);
                  }}
                  className="press-tap w-full app-card flex items-center gap-3 px-4 py-3.5 text-left mb-0"
                  aria-expanded={isOpen}
                  data-testid={`price-category-${cat.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-[var(--theme-text)] tracking-[-0.01em]">
                      {lang === "ka" ? cat.category : cat.subtitle}
                    </h3>
                    <p className="text-[12px] text-[var(--theme-muted1)] mt-0.5">
                      {cat.items.length} {t("სერვისი", "services")} · {t("დან", "from")} {fromPrice} ₾
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 text-[var(--theme-muted1)]/60"
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
                      <div className="app-list mt-2">
                        {cat.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              hapticTap();
                              scrollToBooking();
                            }}
                            className={cn(
                              "press-tap app-row w-full text-left",
                              "min-h-[60px]"
                            )}
                            data-testid={`price-row-${cat.id}-${i}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] font-medium text-[var(--theme-text)] truncate">
                                {lang === "ka" ? item.nameKa : item.name}
                              </div>
                              {lang === "ka" && (
                                <div className="text-[11.5px] text-[var(--theme-muted1)]/80 mt-0.5 truncate">
                                  {item.name}
                                </div>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1 tabular-nums shrink-0 mr-1">
                              <span className="text-[15px] font-semibold text-[var(--theme-text)]">
                                {typeof item.price === "number" ? item.price : item.price}
                              </span>
                              <span className="text-[12px] text-[var(--theme-muted1)]">₾</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--theme-muted1)]/40 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-[var(--theme-muted1)]/70 mt-6">
          {t(
            "* ყველა ფასი მითითებულია ლარში (₾). შეიძლება განსხვავდებოდეს.",
            "* All prices are in Georgian Lari (₾). Subject to change."
          )}
        </p>
      </div>
    </section>
  );
}
