import { Sparkles, User, Syringe, Package, Hand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    id: 1,
    icon: Sparkles,
    title: "Laser Epilation – Women",
    description: "Face, body, bikini, armpits, full body"
  },
  {
    id: 2,
    icon: User,
    title: "Laser Epilation – Men",
    description: "Face, neck, chest, back, shoulders"
  },
  {
    id: 3,
    icon: Syringe,
    title: "Cosmetology / Injectables",
    description: "Fillers, meso, biorevitalization, tox"
  },
  {
    id: 4,
    icon: Package,
    title: "Packages",
    description: "Full legs + bikini, combo sets"
  },
  {
    id: 5,
    icon: Hand,
    title: "Nail Services",
    description: "Professional manicure and pedicure treatments"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
            Our Services
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Indulge in our carefully curated selection of beauty and wellness treatments
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.id} 
                className="hover-elevate transition-all duration-300 overflow-visible"
                data-testid={`card-service-${service.id}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.1 }}
                  >
                    <Icon className="w-6 h-6" style={{ color: 'var(--theme-accent)', opacity: 1 }} />
                  </div>
                  
                  <h3 className="font-serif text-xl text-foreground">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
