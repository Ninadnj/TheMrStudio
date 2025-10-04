import { Sparkles, Hand, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Service } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  "Nail": Hand,
  "Epilation": Sparkles,
};

const categoryDescriptions: Record<string, string> = {
  "Nail": "მანიკიური, პედიკიური და დიზაინი / Manicure, Pedicure & Design",
  "Epilation": "ლაზერული ეპილაცია / Laser Hair Removal",
};

export default function Services() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Nail", "Epilation"]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    services.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => parseInt(a.order) - parseInt(b.order));
    });
    return grouped;
  }, [services]);

  const categories = Object.keys(servicesByCategory).sort();

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
      <section id="services" className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">იტვირთება სერვისები...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
            ჩვენი სერვისები
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Our Services
          </p>
        </div>
        
        <div className="space-y-12 max-w-5xl mx-auto">
          {categories.map((category, categoryIndex) => {
            const Icon = categoryIcons[category] || Hand;
            const categoryServices = servicesByCategory[category];
            const isExpanded = expandedCategories.includes(category);
            
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
                <div className="border border-border rounded-md bg-card/30 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-8 flex items-center justify-between hover-elevate active-elevate-2 transition-all"
                    data-testid={`button-toggle-${category}`}
                  >
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-14 h-14 rounded-md flex items-center justify-center" 
                        style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
                      >
                        <Icon className="w-7 h-7" style={{ color: 'var(--theme-accent)' }} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif text-3xl text-foreground tracking-tight mb-1">
                          {category}
                        </h3>
                        <p className="text-sm text-muted-foreground tracking-wide">
                          {categoryDescriptions[category] || ""}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-background/50">
                      <div className="p-8 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryServices.map((service) => (
                            <div
                              key={service.id}
                              className="py-2 px-4 text-sm text-foreground/80 leading-relaxed"
                              data-testid={`service-${service.id}`}
                            >
                              {service.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
