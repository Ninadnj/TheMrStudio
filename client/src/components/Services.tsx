import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ServicesSection } from "@shared/schema";

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
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
            {servicesSection?.title || "ჩვენი სერვისები"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {servicesSection?.subtitle || "Our Services"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, categoryIndex) => {
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
                <div className="border border-border rounded-md bg-card/30 p-10 hover-lift hover-border-accent transition-all h-full cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-display text-3xl text-foreground mb-4">
                      {category}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {categoryDescriptions[category] || ""}
                    </p>
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
