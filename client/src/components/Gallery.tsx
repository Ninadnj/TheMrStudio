import { X, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import type { GalleryImage } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";
import SectionHeader from "@/components/SectionHeader";
import QuietStatus from "@/components/QuietStatus";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

export default function Gallery() {
  const { t } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const galleryRef = useRef(null);
  const isInView = useInView(galleryRef, { once: true, amount: 0.05 });

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const imagesByCategory = useMemo(() => {
    const grouped: Record<string, GalleryImage[]> = {};
    images.forEach((image) => {
      if (!grouped[image.category]) grouped[image.category] = [];
      grouped[image.category].push(image);
    });
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => parseInt(a.order) - parseInt(b.order));
    });
    return grouped;
  }, [images]);

  const categories = Object.keys(imagesByCategory).sort();

  const displayedImages = useMemo(() => {
    if (selectedCategory) {
      return imagesByCategory[selectedCategory] || [];
    }
    return [...images].sort((a, b) => parseInt(a.order) - parseInt(b.order));
  }, [selectedCategory, imagesByCategory, images]);

  const openLightbox = (index: number) => {
    setLightboxImage(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "unset";
  };

  const goToPrevious = () => {
    if (lightboxImage !== null && lightboxImage > 0) setLightboxImage(lightboxImage - 1);
  };

  const goToNext = () => {
    if (lightboxImage !== null && lightboxImage < displayedImages.length - 1)
      setLightboxImage(lightboxImage + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImage === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, displayedImages.length]);

  if (isLoading) {
    return (
      <section id="gallery" className="app-section">
        <div className="app-shell">
          <QuietStatus label="Curating the gallery…" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="scroll-mt-20 app-section md:scroll-mt-24">
        <div className="app-shell-wide">
          <SectionHeader
            title={t("გალერეა", "Gallery")}
            className="mb-5"
          />

          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide mb-5">
              <button
                onClick={() => {
                  hapticTap();
                  setSelectedCategory(null);
                }}
                className="ios-chip"
                data-active={selectedCategory === null}
                data-testid="filter-all"
              >
                {t("ყველა", "All")}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    hapticTap();
                    setSelectedCategory(category);
                  }}
                  className="ios-chip"
                  data-active={selectedCategory === category}
                  data-testid={`filter-${category}`}
                >
                  {stripDecorativeSymbols(category)}
                </button>
              ))}
            </div>
          )}

          <div ref={galleryRef}>
            {displayedImages.length === 0 ? (
              <div className="gallery-empty-state">
                <div className="gallery-empty-preview" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="gallery-empty-copy">
                  <div className="gallery-empty-icon">
                    <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <p className="app-eyebrow">{t("Portfolio loading", "Portfolio loading")}</p>
                  <h3>{t("გალერეა მალე განახლდება", "The gallery is being curated")}</h3>
                  <p>
                    {t(
                      "სტუდიის ახალი ნამუშევრები აქ გამოჩნდება. მანამდე შეგიძლია დაჯავშნო ვიზიტი და ნახო სერვისები.",
                      "Fresh studio work will appear here soon. For now, book a visit or browse the service menu."
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="pill-secondary mt-4 h-11 min-h-0 px-4 text-[13px]"
                    data-testid="gallery-empty-booking"
                  >
                    {t("დაჯავშნა", "Book a visit")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                {displayedImages.map((image, index) => {
                  return (
                    <motion.button
                      key={image.id}
                      type="button"
                      className="press-tap editorial-grain relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--theme-surface-muted)] border border-[var(--theme-line)]/60 group"
                      initial={{ opacity: 0, y: 12 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index * 0.04, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => {
                        hapticTap();
                        openLightbox(index);
                      }}
                      data-testid={`gallery-image-${image.id}`}
                    >
                      {(() => {
                        const isVideo = isVideoUrl(image.imageUrl);
                        const cls =
                          "h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]";
                        return isVideo ? (
                          <video
                            src={image.imageUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={cls}
                          />
                        ) : (
                          <img
                            src={image.imageUrl}
                            alt={`${stripDecorativeSymbols(image.category)} ${image.order}`}
                            className={cls}
                            loading="lazy"
                          />
                        );
                      })()}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-medium text-white">
                          {stripDecorativeSymbols(image.category)}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage !== null && displayedImages[lightboxImage] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            data-testid="button-close-lightbox"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4 z-10 text-white text-xs font-medium bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
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
              aria-label="Previous"
            >
              <ChevronLeft className="w-7 h-7" />
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
              aria-label="Next"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          <div
            className="max-w-4xl max-h-[88vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const popup = displayedImages[lightboxImage];
              const isVideo = isVideoUrl(popup.imageUrl);
              const cls = "w-full h-full object-contain rounded-2xl";
              return isVideo ? (
                <video src={popup.imageUrl} autoPlay controls playsInline className={cls} />
              ) : (
                <img
                  src={popup.imageUrl}
                  alt={`${stripDecorativeSymbols(popup.category)} ${popup.order}`}
                  className={cls}
                />
              );
            })()}
            <div className="text-center mt-3">
              <p className="text-white/85 text-sm font-medium">
                {stripDecorativeSymbols(displayedImages[lightboxImage].category)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
