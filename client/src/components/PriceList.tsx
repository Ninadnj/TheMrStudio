import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PriceListItem = {
  id: number;
  category: string;
  subtitle?: string;
  accentOpacity: string;
  items: Array<{ name: string; price: number | string }>;
};

const priceLists: PriceListItem[] = [
  {
    id: 1,
    category: "მანიკური / პედიკური",
    accentOpacity: "opacity-100",
    items: [
      { name: "გელ-ლაქი ნუნების მოწესრიგებით", price: 35 },
      { name: "გელ ლაქი ნუნების აწევით", price: 25 },
      { name: "გამაგრება", price: 45 },
      { name: "გამაგრების მოხსნა, გამაგრება", price: 55 },
      { name: "დაგრძელება", price: 80 },
      { name: "დაგრძელების კორექცია", price: 70 },
      { name: "გელ-ლაქის მოხსნა", price: 5 },
      { name: "გამაგრების მოხსნა", price: 10 },
      { name: "1 ფრჩხილის გამაგრება", price: 4 },
      { name: "1 ფრჩხილის დაგრძელება", price: 7 },
      { name: "პედიკური კლასიკური", price: 40 },
      { name: "პედიკური გელ-ლაქით", price: 55 },
      { name: "გელ-ლაქის მოხსნა და ფორმის მოცემა", price: 10 },
      { name: "გელ-ლაქის გადასმა ნუნების აწევით", price: 30 },
      { name: "ფრენჩი", price: 5 },
      { name: "ქრომი", price: 10 },
      { name: "სტიკრები", price: "1 ლარიდან" }
    ]
  },
  {
    id: 2,
    category: "ლაზერული ეპილაცია – ქალებისთვის",
    subtitle: "Laser Epilation – Women",
    accentOpacity: "opacity-80",
    items: [
      { name: "მთლიანი სახე / Full Face", price: 20 },
      { name: "მთლიანი სახე+ყელი / Full Face+Neck", price: 25 },
      { name: "შუბლი / Forehead", price: 10 },
      { name: "ნიკაპი / Chin", price: 5 },
      { name: "ღაბაბი / Under Chin", price: 5 },
      { name: "ნიკაპი+ღაბაბი / Chin+Under Chin", price: 8 },
      { name: "ზედა ტუჩი / Upper Lip", price: 5 },
      { name: "ბაკები / Sideburns", price: 10 },
      { name: "ლოყები / Cheeks", price: 10 },
      { name: "წარბის გადაბმის ზონა / Parts of Eyebrow Adhesion", price: 5 },
      { name: "ცხვირის ნესტო + ყურები", price: 10 },
      { name: "კისერი (უკნიდან) / Neck (from the back)", price: 10 },
      { name: "ყელი / Neck (from the front)", price: 10 },
      { name: "კეფა / Between Head and Neck", price: 10 },
      { name: "გულ-მკერდი / Chest", price: 20 },
      { name: "დვრილები / Breastfeeding part", price: 5 },
      { name: "მკერდის შუა ხაზი / The Middle Line of The Breast", price: 10 },
      { name: "მუცელი / Abdomen", price: 18 },
      { name: "მუცლის თეთრი ხაზი / Abdomen Line", price: 8 },
      { name: "ზედაპირული ბიკინი / Bikini", price: 10 },
      { name: "ღრმა ბიკინი ანუსით / Full Bikini", price: 25 },
      { name: "დუნდულები / Buttocks", price: 15 },
      { name: "უკანა ტანი (ანუსი) / Anus", price: 5 },
      { name: "მთლიანი ფეხები / Full Legs", price: 30 },
      { name: "ზურგი / Full Back", price: 25 },
      { name: "წელი / Lower Back", price: 18 },
      { name: "ხელები სრულად / Full Hands", price: 25 },
      { name: "ნახევარი ხელი / Half Hand", price: 15 },
      { name: "იღლიები / Armpit", price: 10 },
      { name: "ხელის მტევნები+თითები / Hands+Fingers", price: 8 }
    ]
  },
  {
    id: 3,
    category: "ლაზერული ეპილაცია – მამაკაცებისთვის",
    subtitle: "Laser Epilation – Men",
    accentOpacity: "opacity-90",
    items: [
      { name: "მთლიანი სხეული / Full Body", price: 75 },
      { name: "მთლიანი ზურგი / Full Back", price: 50 },
      { name: "კისერი / Neck (from back)", price: 15 },
      { name: "ყელი / Neck (from front)", price: 12 },
      { name: "ღაწვი / Beard/Chin", price: 15 },
      { name: "ღაწვი, ყელი და კისერი / Beard, Neck and Back Neck", price: 35 },
      { name: "ხელი + იღლია / Hand + Armpit", price: 40 },
      { name: "გულ-მკერდი / Chest", price: 30 },
      { name: "ბეჭები / Calves", price: 30 },
      { name: "მხრები / Shoulders", price: 20 },
      { name: "მუცელი / Abdomen", price: 30 },
      { name: "წელი / Lower Back", price: 30 },
      { name: "ფეხები / Legs", price: 50 },
      { name: "სახე / Face", price: 30 },
      { name: "შუბლი / Forehead", price: 15 },
      { name: "წარბებს შორის / Between Eyebrows", price: 5 }
    ]
  },
  {
    id: 4,
    category: "კოსმეტოლოგია / ინექციები",
    subtitle: "Cosmetology / Injectables",
    accentOpacity: "opacity-70",
    items: [
      { name: "ფილერი Juvederm", price: 500 },
      { name: "ფილერი ReMedium", price: 250 },
      { name: "ფილერი Replengen", price: 250 },
      { name: "ბოტოქსი NABOTA", price: 250 },
      { name: "ბოტოქსი Metox", price: 250 },
      { name: "ბუსტერი Karisma", price: 500 },
      { name: "ბუსტერი Revitrane", price: 500 },
      { name: "ბუსტერი Profhilo", price: 500 },
      { name: "ბიორევიტალიზაცია RRC", price: 100 },
      { name: "ბიორევიტალიზაცია ჰეარონი", price: 250 },
      { name: "მეზოთერაპია / Mesotherapy", price: 100 },
      { name: "პილინგი / Peeling", price: 100 },
      { name: "პლაზმო / Plasmo", price: 70 },
      { name: "პაპილომის მოწვა / Papilloma Removal", price: 15 }
    ]
  },
  {
    id: 5,
    category: "ეკონომ პაკეტი",
    subtitle: "Economy Package",
    accentOpacity: "opacity-85",
    items: [
      { name: "მთლიანი სხეული / Full Body", price: 75 },
      { name: "მთლიანი სხეული + სახე / Full Body + Face", price: 85 },
      { name: "4 ძირითადი ზონა: ხელი, ფეხი, სრული ბიკინი, იღლია / 4 Main Zones: Hands, Legs, Full Bikini, Armpits", price: 55 }
    ]
  }
];

export default function PriceList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
    <section id="prices" className="py-20 lg:py-32 bg-background" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-3 text-foreground font-normal">
            სერვისების ფასები
          </h2>
          <p className="text-lg text-muted-foreground/80 tracking-wide">
            Price Lists
          </p>
        </div>

        <div className={`relative transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 pb-4">
              {priceLists.map((list) => (
                <Card 
                  key={list.id}
                  data-price-card
                  className="flex-shrink-0 w-[90vw] md:w-[45vw] lg:w-[30vw] max-w-sm overflow-hidden hover-elevate transition-all duration-300 cursor-pointer snap-start border-2"
                  style={{ borderColor: '#A89B8E33' }}
                  data-testid={`card-price-${list.id}`}
                  onClick={() => setExpandedCard(expandedCard === list.id ? null : list.id)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center bg-card">
                    <div className={`absolute top-0 left-0 w-12 h-1 ${list.accentOpacity}`} style={{ backgroundColor: 'var(--theme-accent)' }}></div>
                    <div className="text-center px-6">
                      <h3 className="font-serif text-2xl text-foreground mb-2">
                        {list.category}
                      </h3>
                      {list.subtitle && (
                        <p className="text-sm text-muted-foreground/80 mb-3 tracking-wide">
                          {list.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground tracking-wide">
                        დააჭირეთ ფასების სანახავად
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
                              {item.price ? (typeof item.price === 'number' ? `${item.price} ₾` : item.price) : '—'}
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
