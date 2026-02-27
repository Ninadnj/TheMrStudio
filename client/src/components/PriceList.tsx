import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";
import { cn } from "@/lib/utils";

type PriceListItem = {
  id: string;
  category: string;
  subtitle: string;
  icon: string;
  color: string;
  items: Array<{ name: string; nameKa: string; price: number | string }>;
};

const staticPriceLists: PriceListItem[] = [
  {
    id: "nails",
    category: "ფრჩხილები",
    subtitle: "მანიკური / პედიკური",
    icon: "✦",
    color: "from-[#D4B483]/20 to-[#A89B8E]/10",
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
    category: "ლაზერი (ქალბ.)",
    subtitle: "ლაზერული ეპილაცია — ქალბატონები",
    icon: "◈",
    color: "from-[#8B7355]/20 to-[#6B5A45]/10",
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
    category: "ლაზერი (მამ.)",
    subtitle: "ლაზერული ეპილაცია — მამაკაცები",
    icon: "◈",
    color: "from-[#6B5A45]/20 to-[#4A3D30]/10",
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
    subtitle: "სახის კოსმეტოლოგია / ინექციები",
    icon: "✧",
    color: "from-[#C4A882]/20 to-[#9A8170]/10",
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

export default function PriceList() {
  const [activeCategory, setActiveCategory] = useState<string>(staticPriceLists[0].id);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("category-", ""));
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    staticPriceLists.forEach((list) => {
      const element = document.getElementById(`category-${list.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section id="prices" className="relative bg-background py-24 lg:py-36">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* Mobile Header */}
        <div className="lg:hidden mb-12 text-center">
          <span className="text-theme-muted tracking-widest text-xs uppercase mb-2 block">სერვისი / ფასი</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground">ფასები</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 lg:relative">
            <div className="sticky top-24 z-30">

              {/* Desktop Title */}
              <div className="hidden lg:block mb-12">
                <span className="text-theme-muted tracking-widest text-xs uppercase mb-4 block">სერვისი / ფასი</span>
                <h2 className="font-display text-5xl text-foreground leading-none">
                  სერვისების<br />
                  <span className="italic opacity-60 font-light">ფასები</span>
                </h2>
              </div>

              {/* Category Navigation */}
              <nav className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                {staticPriceLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => scrollToCategory(list.id)}
                    className={cn(
                      `flex items-center gap-4 group transition-all duration-300 min-w-max lg:min-w-0 text-left px-4 py-4 rounded-none border`,
                      activeCategory === list.id
                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[#09090b]"
                        : "border-[var(--theme-accent)]/20 hover:border-[var(--theme-accent)] bg-transparent text-foreground/50"
                    )}
                  >
                    <span className={cn(
                      "font-mono text-lg transition-all duration-300 hidden md:block",
                      activeCategory === list.id ? "text-[#09090b]" : "text-foreground/30"
                    )}>
                      0{staticPriceLists.indexOf(list) + 1}
                    </span>
                    <div className="text-left">
                      <span className={cn(
                        "text-sm lg:text-base font-mono uppercase tracking-widest block transition-all duration-300",
                        activeCategory === list.id ? "text-[#09090b]" : "text-foreground/50 group-hover:text-foreground/80"
                      )}>
                        {list.category}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Booking CTA below nav */}
              <div className="hidden lg:block mt-12 pt-8 border-t border-border/40">
                <p className="text-xs text-foreground/40 font-sans mb-4 leading-relaxed">
                  ფასები შეიძლება განსხვავდებოდეს. დეტალებისთვის დაგვიკავშირდით.
                </p>
                <button
                  onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm text-theme-accent font-medium tracking-wider uppercase transition-opacity hover:opacity-70 flex items-center gap-2"
                >
                  <span>დაჯავშნა</span>
                  <span className="text-lg leading-none">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Service Items */}
          <div className="lg:col-span-8 space-y-20">
            {staticPriceLists.map((list, listIdx) => (
              <motion.div
                key={list.id}
                id={`category-${list.id}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-32"
              >
                {/* Brutalist Category Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[var(--theme-accent)] pb-4 mb-8 mt-16 first:mt-0 gap-4">
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-3xl md:text-5xl text-[var(--theme-accent)]">0{listIdx + 1}</span>
                    <h3 className="font-display text-4xl md:text-6xl text-foreground uppercase tracking-tighter">
                      {list.category}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-[var(--theme-accent)] tracking-widest uppercase">
                    {list.subtitle}
                  </span>
                </div>

                {/* Ledger Items */}
                <motion.div
                  className="space-y-0"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {list.items.map((item, itemIdx) => (
                    <motion.div
                      key={itemIdx}
                      variants={itemVariants}
                      className="group flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6 py-4 md:py-6 border-b border-[var(--theme-accent)]/20 hover:border-[var(--theme-accent)] transition-colors duration-300 cursor-default"
                    >
                      <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-sans font-medium text-foreground tracking-tight uppercase">
                          {item.name}
                        </span>
                        <span className="text-xs md:text-sm font-mono text-foreground/50 tracking-widest uppercase mt-1">
                          {item.nameKa}
                        </span>
                      </div>
                      <div className="hidden md:block flex-1 border-b border-dashed border-foreground/10 mb-2 group-hover:border-[var(--theme-accent)]/50 transition-colors duration-300" />
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">₾</span>
                        <span className="text-lg md:text-xl font-mono text-foreground group-hover:text-[var(--theme-accent)] transition-colors duration-300">
                          {typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}

            {/* Bottom Note */}
            <div className="pt-4 text-center lg:text-left">
              <p className="text-xs text-foreground/30 font-sans">
                * ყველა ფასი მითითებულია ლარში (₾). ფასები შეიძლება შეიცვალოს.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
