import { Sparkles, Heart, Hand, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    id: 1,
    icon: Sparkles,
    title: "Signature Facials",
    description: "Rejuvenate your skin with our customized facial treatments using premium organic products",
    price: 120,
    duration: "60-90 min"
  },
  {
    id: 2,
    icon: Heart,
    title: "Therapeutic Massage",
    description: "Release tension and restore balance with our expert massage therapies",
    price: 150,
    duration: "60-120 min"
  },
  {
    id: 3,
    icon: Hand,
    title: "Manicure & Pedicure",
    description: "Pamper your hands and feet with our luxurious nail care services",
    price: 80,
    duration: "45-90 min"
  },
  {
    id: 4,
    icon: Scissors,
    title: "Hair Styling",
    description: "Transform your look with our professional hair care and styling services",
    price: 100,
    duration: "60-180 min"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.id} 
                className="hover-elevate transition-all duration-300 overflow-visible"
                data-testid={`card-service-${service.id}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="font-serif text-xl text-foreground">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-primary">
                      From ${service.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {service.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
