import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const priceLists = [
  {
    id: 1,
    category: "Nail Services",
    color: "bg-gradient-to-br from-stone-100 to-neutral-50 dark:from-stone-900/30 dark:to-neutral-900/20",
    items: [
      { name: "Manicure", price: 45 },
      { name: "Pedicure", price: 65 },
      { name: "Gel Polish", price: 35 },
      { name: "Nail Art", price: 55 }
    ]
  },
  {
    id: 2,
    category: "Laser Epilation – Women",
    color: "bg-gradient-to-br from-neutral-200/80 to-stone-100/60 dark:from-neutral-800/30 dark:to-stone-800/20",
    items: [
      { name: "Face", price: 80 },
      { name: "Body", price: 150 },
      { name: "Bikini", price: 95 },
      { name: "Armpits", price: 60 },
      { name: "Full Body", price: 350 }
    ]
  },
  {
    id: 3,
    category: "Laser Epilation – Men",
    color: "bg-gradient-to-br from-zinc-100 to-gray-50 dark:from-zinc-900/30 dark:to-gray-900/20",
    items: [
      { name: "Face", price: 90 },
      { name: "Neck", price: 70 },
      { name: "Chest", price: 120 },
      { name: "Back", price: 130 },
      { name: "Shoulders", price: 85 }
    ]
  },
  {
    id: 4,
    category: "Cosmetology / Injectables",
    color: "bg-gradient-to-br from-warmGray-100 to-stone-50 dark:from-warmGray-900/30 dark:to-stone-900/20",
    items: [
      { name: "Fillers", price: 450 },
      { name: "Meso", price: 180 },
      { name: "Biorevitalization", price: 220 },
      { name: "Tox", price: 280 }
    ]
  },
  {
    id: 5,
    category: "Packages",
    color: "bg-gradient-to-br from-slate-100/80 to-neutral-100/60 dark:from-slate-900/30 dark:to-neutral-900/20",
    items: [
      { name: "Full legs + bikini", price: 195 },
      { name: "Combo sets", price: 299 }
    ]
  }
];

export default function PriceList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    const cardWidth = container.querySelector('[data-price-card]')?.clientWidth || 0;
    if (cardWidth > 0) {
      const gap = 24;
      const activeIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(activeIndex, priceLists.length - 1));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons, { passive: true });
    window.addEventListener('resize', checkScrollButtons);
    
    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [priceLists.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('[data-price-card]')?.clientWidth || 0;
    const scrollAmount = cardWidth + 24; // card width + gap
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.min(priceLists.length - 1, currentIndex + 1));
    }
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('[data-price-card]')?.clientWidth || 0;
    const scrollAmount = index * (cardWidth + 24); // index * (card width + gap)
    
    container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  return (
    <section id="prices" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
            Price Lists
          </h2>
          <p className="text-base text-muted-foreground tracking-wide">
            Browse our comprehensive pricing for all services
          </p>
        </div>

        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6">
              {priceLists.map((list) => (
                <Card 
                  key={list.id}
                  data-price-card
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden hover-elevate transition-all duration-300 cursor-pointer snap-start"
                  data-testid={`card-price-${list.id}`}
                  onClick={() => setExpandedCard(expandedCard === list.id ? null : list.id)}
                >
                  <div className={`aspect-[4/3] relative overflow-hidden flex items-center justify-center ${list.color}`}>
                    <div className="text-center px-6">
                      <h3 className="font-serif text-3xl text-foreground/90 mb-3">
                        {list.category}
                      </h3>
                      <p className="text-sm text-foreground/60 tracking-wide">
                        Click to view pricing
                      </p>
                    </div>
                  </div>
                  
                  {expandedCard === list.id && (
                    <div className="p-6 border-t border-border bg-card">
                      <div className="space-y-3">
                        {list.items.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center py-2"
                            data-testid={`price-item-${list.id}-${index}`}
                          >
                            <span className="text-sm text-foreground">{item.name}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--theme-accent)' }}>
                              {item.price ? `$${item.price}` : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {canScrollLeft && (
            <Button
              size="icon"
              variant="outline"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 backdrop-blur-sm"
              onClick={() => scroll('left')}
              data-testid="button-scroll-left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          {canScrollRight && (
            <Button
              size="icon"
              variant="outline"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 backdrop-blur-sm"
              onClick={() => scroll('right')}
              data-testid="button-scroll-right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {priceLists.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-border'
              }`}
              onClick={() => scrollToCard(index)}
              data-testid={`indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
