import { Sparkles, Hand, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GalleryImage } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  "ფრჩხილები": Hand,
  "ლაზერი": Sparkles,
  "კოსმეტოლოგია": Star,
};

export default function Gallery() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["ფრჩხილები", "ლაზერი", "კოსმეტოლოგია"]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const imagesByCategory = useMemo(() => {
    const grouped: Record<string, GalleryImage[]> = {};
    images.forEach(image => {
      if (!grouped[image.category]) {
        grouped[image.category] = [];
      }
      grouped[image.category].push(image);
    });
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => parseInt(a.order) - parseInt(b.order));
    });
    return grouped;
  }, [images]);

  const categories = Object.keys(imagesByCategory).sort();

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
      <section id="gallery" className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">იტვირთება გალერეა...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
            გალერეა
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-2">
            ფრჩხილები , ლაზერი , კოსმეტოლოგია
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
            ჩვენი სამუშაოების პორტფოლიო / Our Work Portfolio
          </p>
        </div>
        
        <div className="space-y-12 max-w-6xl mx-auto">
          {categories.length === 0 && (
            <p className="text-center text-muted-foreground">
              ფოტოები ჯერ არ დაემატა / No images added yet
            </p>
          )}
          {categories.map((category, categoryIndex) => {
            const Icon = categoryIcons[category] || Hand;
            const categoryImages = imagesByCategory[category];
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
                data-testid={`category-gallery-${category}`}
              >
                <div className="border border-border rounded-md bg-card/30 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-8 flex items-center justify-between hover-elevate active-elevate-2 transition-all"
                    data-testid={`button-toggle-gallery-${category}`}
                  >
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-14 h-14 rounded-md flex items-center justify-center" 
                        style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: 'var(--theme-accent)' }}
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-serif text-foreground font-normal mb-1">
                          {category}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {categoryImages.length} {categoryImages.length === 1 ? 'ფოტო' : 'ფოტო'}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-8 pb-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryImages.map((image) => (
                          <div
                            key={image.id}
                            className="aspect-square rounded-md overflow-hidden bg-muted hover-elevate transition-all cursor-pointer"
                            data-testid={`gallery-image-${image.id}`}
                          >
                            <img
                              src={image.imageUrl}
                              alt={`${category} ${image.order}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
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
