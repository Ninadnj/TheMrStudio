import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import priceImage1 from "@assets/1a440797-39f6-431a-a76a-9e1b68847e45_1759482191061.jpeg";
import priceImage2 from "@assets/8f73a5f6-561e-4a79-a72c-74c6302f638d_1759482191062.jpeg";
import priceImage3 from "@assets/8cc8ea7d-b26e-47b1-b7cf-5339bb9bec05_1759482191062.jpeg";
import priceImage4 from "@assets/78b69246-cabd-4fcc-9d1a-f6c9a431ad8c_1759482191063.jpeg";
import priceImage5 from "@assets/82dc3095-1932-488b-ab54-0d17e25fba9b_1759482191063.jpeg";
import priceImage6 from "@assets/82dc3095-1932-488b-ab54-0d17e25fba9b (1)_1759482191063.jpeg";
import priceImage7 from "@assets/2615c70a-78ce-4323-a82d-299160d84a1f_1759482191064.jpeg";
import priceImage8 from "@assets/321610ae-b9e8-416b-8b60-8dfca4376534_1759482191064.jpeg";
import priceImage9 from "@assets/c8e4d02a-0024-4dea-a9f2-1ef3498ecb02_1759482191064.jpeg";
import priceImage10 from "@assets/d2146980-6e6b-4e45-8101-d74e5c0c54e9_1759482191065.jpeg";
import priceImage11 from "@assets/e853b42f-4d08-46de-bf06-f380ac6db89b_1759482191065.jpeg";

const priceLists = [
  {
    id: 1,
    category: "Laser Epilation – Women",
    imageUrl: priceImage1,
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
    imageUrl: priceImage2,
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
    imageUrl: priceImage3,
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
    imageUrl: priceImage4,
    items: [
      { name: "Full legs + bikini", price: null },
      { name: "Combo sets", price: null }
    ]
  },
  {
    id: 5,
    category: "Nail Services",
    imageUrl: priceImage5,
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
