import { Sparkles, Hand, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const categoryIcons: Record<string, any> = {
  "მანიკური / პედიკური": Hand,
  "ლაზერული ეპილაცია": Sparkles,
  "კოსმეტოლოგია": Star,
};

const categoryDescriptions: Record<string, string> = {
  "მანიკური / პედიკური": "Professional nail care using premium gel polishes and advanced techniques. Our manicure and pedicure services include nail strengthening, extensions, and artistic designs.",
  "ლაზერული ეპილაცია": "Advanced laser hair removal technology with safe and effective treatments. Our laser systems provide long-lasting results with minimal discomfort.",
  "კოსმეტოლოგია": "Professional skincare and beauty treatments using modern techniques and high-quality products for optimal results.",
};

export default function Services() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const categories = ["მანიკური / პედიკური", "ლაზერული ეპილაცია", "კოსმეტოლოგია"];

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => {
              if (prev.includes(index)) return prev;
              return [...prev, index];
            });
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [categories.length]);

  return (
    <section id="services" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-3 text-foreground font-normal">
            ჩვენი სერვისები
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto tracking-wide">
            Our Services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, categoryIndex) => {
            const Icon = categoryIcons[category] || Hand;
            
            return (
              <div
                key={category}
                ref={el => cardRefs.current[categoryIndex] = el}
                className={`transition-all duration-700 ${
                  visibleCards.includes(categoryIndex) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${categoryIndex * 100}ms` }}
                data-testid={`category-${category}`}
              >
                <div className="border border-border rounded-md bg-card/30 p-8 hover-elevate transition-all h-full">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div 
                      className="w-16 h-16 rounded-md flex items-center justify-center" 
                      style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
                    >
                      <Icon className="w-8 h-8" style={{ color: 'var(--theme-accent)' }} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-foreground tracking-tight mb-3">
                        {category}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {categoryDescriptions[category] || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
