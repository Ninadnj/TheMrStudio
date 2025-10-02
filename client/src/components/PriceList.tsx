import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const priceLists = [
  {
    id: 1,
    category: "Nail Services",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    category: "Laser Treatments",
    imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop",
  },
  {
    id: 3,
    category: "Facial Services",
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop",
  },
  {
    id: 4,
    category: "Massage Therapy",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
  },
  {
    id: 5,
    category: "Hair Services",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
  },
  {
    id: 6,
    category: "Body Treatments",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
  },
];

export default function PriceList() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentIndex((prev) => Math.min(priceLists.length - 1, prev + 1));
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground">
            Price Lists
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse our comprehensive pricing for all services
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {priceLists.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden hover-elevate transition-all duration-300"
                  data-testid={`card-price-${item.id}`}
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-serif text-2xl text-foreground">
                        {item.category}
                      </h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {currentIndex > 0 && (
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

          {currentIndex < priceLists.length - 3 && (
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
              onClick={() => setCurrentIndex(index)}
              data-testid={`indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
