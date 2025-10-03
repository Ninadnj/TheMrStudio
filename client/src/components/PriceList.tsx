import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const priceLists = [
  {
    id: 1,
    category: "Laser Epilation – Women",
    imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop",
    items: [
      { name: "Face", price: null },
      { name: "Body", price: null },
      { name: "Bikini", price: null },
      { name: "Armpits", price: null },
      { name: "Full Body", price: null }
    ]
  },
  {
    id: 2,
    category: "Laser Epilation – Men",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop",
    items: [
      { name: "Face", price: null },
      { name: "Neck", price: null },
      { name: "Chest", price: null },
      { name: "Back", price: null },
      { name: "Shoulders", price: null }
    ]
  },
  {
    id: 3,
    category: "Cosmetology / Injectables",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
    items: [
      { name: "Fillers", price: null },
      { name: "Meso", price: null },
      { name: "Biorevitalization", price: null },
      { name: "Tox", price: null }
    ]
  },
  {
    id: 4,
    category: "Packages",
    imageUrl: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800&h=600&fit=crop",
    items: [
      { name: "Full legs + bikini", price: null },
      { name: "Combo sets", price: null }
    ]
  },
  {
    id: 5,
    category: "Nail Services",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
    items: [
      { name: "Manicure", price: null },
      { name: "Pedicure", price: null },
      { name: "Gel Polish", price: null },
      { name: "Nail Art", price: null }
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
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={list.imageUrl}
                      alt={list.category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-serif text-2xl text-foreground mb-2">
                        {list.category}
                      </h3>
                      <p className="text-xs text-muted-foreground">
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
