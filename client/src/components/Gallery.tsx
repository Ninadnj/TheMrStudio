import { Sparkles, Hand, Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GalleryImage } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  "ფრჩხილები": Hand,
  "ლაზერი": Sparkles,
  "კოსმეტოლოგია": Star,
};

// Bento grid pattern - defines which images should be larger
const getBentoPattern = (index: number): string => {
  const patterns = [
    "col-span-2 row-span-2", // Large square (0)
    "col-span-1 row-span-1", // Small (1)
    "col-span-1 row-span-1", // Small (2)
    "col-span-1 row-span-2", // Tall (3)
    "col-span-1 row-span-1", // Small (4)
    "col-span-2 row-span-1", // Wide (5)
    "col-span-1 row-span-1", // Small (6)
    "col-span-1 row-span-1", // Small (7)
    "col-span-1 row-span-2", // Tall (8)
    "col-span-2 row-span-1", // Wide (9)
  ];
  
  return patterns[index % patterns.length];
};

export default function Gallery() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
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
  
  const displayedImages = useMemo(() => {
    if (selectedCategory) {
      return imagesByCategory[selectedCategory] || [];
    }
    return images.sort((a, b) => parseInt(a.order) - parseInt(b.order));
  }, [selectedCategory, imagesByCategory, images]);

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
  }, [displayedImages.length]);

  const openLightbox = (index: number) => {
    setLightboxImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (lightboxImage !== null && lightboxImage > 0) {
      setLightboxImage(lightboxImage - 1);
    }
  };

  const goToNext = () => {
    if (lightboxImage !== null && lightboxImage < displayedImages.length - 1) {
      setLightboxImage(lightboxImage + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImage === null) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, displayedImages.length]);

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
    <>
      <section id="gallery" className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 text-foreground font-normal">
              გალერეა
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
              ჩვენი სამუშაოების პორტფოლიო
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-theme-accent text-white'
                    : 'bg-card hover-elevate border border-border text-foreground'
                }`}
                data-testid="filter-all"
              >
                ყველა / All
              </button>
              {categories.map((category) => {
                const Icon = categoryIcons[category] || Hand;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category
                        ? 'bg-theme-accent text-white'
                        : 'bg-card hover-elevate border border-border text-foreground'
                    }`}
                    data-testid={`filter-${category}`}
                  >
                    <Icon className="w-4 h-4" />
                    {category}
                  </button>
                );
              })}
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {displayedImages.length === 0 ? (
              <p className="text-center text-muted-foreground">
                ფოტოები ჯერ არ დაემატა / No images added yet
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
                {displayedImages.map((image, index) => {
                  const pattern = getBentoPattern(index);
                  
                  return (
                    <div
                      key={image.id}
                      ref={el => cardRefs.current[index] = el}
                      className={`group relative rounded-xl overflow-hidden bg-muted cursor-pointer transition-all duration-500 ${pattern} ${
                        visibleCards.includes(index)
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95'
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                      onClick={() => openLightbox(index)}
                      data-testid={`gallery-image-${image.id}`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${image.category} ${image.order}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              {image.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage !== null && displayedImages[lightboxImage] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            data-testid="button-close-lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4 z-10 text-white text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            {lightboxImage + 1} / {displayedImages.length}
          </div>

          {lightboxImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full p-3 transition-colors"
              data-testid="button-previous-image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {lightboxImage < displayedImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full p-3 transition-colors"
              data-testid="button-next-image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div
            className="max-w-6xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayedImages[lightboxImage].imageUrl}
              alt={`${displayedImages[lightboxImage].category} ${displayedImages[lightboxImage].order}`}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white text-lg font-medium">
                {displayedImages[lightboxImage].category}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
