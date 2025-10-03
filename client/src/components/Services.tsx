import { Sparkles, User, Syringe, Package, Hand } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    id: 1,
    icon: Hand,
    title: "Nail Services",
    description: "Professional manicure and pedicure treatments"
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Laser Epilation – Women",
    description: "Face, body, bikini, armpits, full body"
  },
  {
    id: 3,
    icon: User,
    title: "Laser Epilation – Men",
    description: "Face, neck, chest, back, shoulders"
  },
  {
    id: 4,
    icon: Syringe,
    title: "Cosmetology / Injectables",
    description: "Fillers, meso, biorevitalization, tox"
  },
  {
    id: 5,
    icon: Package,
    title: "Packages",
    description: "Full legs + bikini, combo sets"
  }
];

export default function Services() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  }, []);

  return (
    <section id="services" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
            Our Services
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Indulge in our carefully curated selection of beauty and wellness treatments
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                ref={el => cardRefs.current[index] = el}
                className={`group relative p-8 rounded-md border border-border bg-card/30 hover-elevate active-elevate-2 hover:shadow-md transition-all duration-700 overflow-visible ${
                  visibleCards.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                data-testid={`card-service-${service.id}`}
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div 
                    className="w-16 h-16 rounded-md flex items-center justify-center transition-all duration-300 group-hover:scale-110" 
                    style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
                  >
                    <Icon className="w-8 h-8 transition-transform duration-300" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl text-foreground tracking-tight">
                      {service.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed tracking-wide">
                      {service.description}
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
