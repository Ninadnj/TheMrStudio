import { Sparkles, Hand, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ServicesSection } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  "მანიკური / პედიკური": Hand,
  "ლაზერული ეპილაცია": Sparkles,
  "კოსმეტოლოგია": Star,
};

const categoryGradients: Record<string, string> = {
  "მანიკური / პედიკური": "from-rose-500/20 to-pink-500/20",
  "ლაზერული ეპილაცია": "from-violet-500/20 to-purple-500/20",
  "კოსმეტოლოგია": "from-amber-500/20 to-orange-500/20",
};

const categoryIconColors: Record<string, string> = {
  "მანიკური / პედიკური": "text-rose-600 dark:text-rose-400",
  "ლაზერული ეპილაცია": "text-violet-600 dark:text-violet-400",
  "კოსმეტოლოგია": "text-amber-600 dark:text-amber-400",
};

export default function Services() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: servicesSection } = useQuery<ServicesSection>({
    queryKey: ["/api/services-section"],
  });

  const categoryDescriptions: Record<string, string> = servicesSection
    ? JSON.parse(servicesSection.categoryDescriptions)
    : {};

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
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-3 text-foreground font-normal">
            {servicesSection?.title || "ჩვენი სერვისები"}
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto tracking-wide">
            {servicesSection?.subtitle || "Our Services"}
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
                      className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${categoryGradients[category]} backdrop-blur-sm shadow-lg`}
                    >
                      <Icon className={`w-10 h-10 ${categoryIconColors[category]}`} />
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
