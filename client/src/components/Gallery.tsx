import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useLenis } from "lenis/react";
import type { GalleryImage } from "@shared/schema";
import { isVideoUrl } from "@/lib/videoUtils";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking, type BookingCategory } from "@/lib/serviceMenu";
import { useStudio } from "@/lib/studio";
import { stagger } from "@/lib/reveal";
import { useGalleryImages } from "@/hooks/use-gallery";

/** Admin categories are Georgian words; give them English names and a booking target. */
const CATEGORY_INFO: Record<string, { en: string; booking?: BookingCategory }> = {
  ფრჩხილები: { en: "Nails", booking: "Manicure" },
  ლაზერი: { en: "Laser", booking: "Epilation" },
  კოსმეტოლოგია: { en: "Cosmetology", booking: "Cosmetology" },
};

function byOrder(a: GalleryImage, b: GalleryImage) {
  return parseInt(a.order) - parseInt(b.order);
}

export default function Gallery() {
  const { t, lang } = useLang();
  const studio = useStudio();
  const { data: images, isLoading } = useGalleryImages();
  const [category, setCategory] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(() => Array.from(new Set(images.map((img) => img.category))).sort(), [images]);
  const shown = useMemo(
    () => [...images].filter((img) => !category || img.category === category).sort(byOrder),
    [images, category]
  );
  const label = (cat: string) => (lang === "ka" ? cat : CATEGORY_INFO[cat]?.en ?? cat);

  if (isLoading) return null;

  return (
    <section id="gallery" className="section scroll-mt-20 md:scroll-mt-24" aria-labelledby="gallery-title">
      <div className="shell">
        <div className="section-head gallery-head">
          <div className="grid gap-4">
            <p className="eyebrow" data-reveal="rise">{t("ნამუშევრები", "Portfolio")}</p>
            <h2 id="gallery-title" className="display section-title" data-reveal="mask">
              <span>{t("გალერეა", "Gallery")}</span>
            </h2>
          </div>

          {categories.length > 1 && (
            <div className="text-tabs" role="group" aria-label={t("კატეგორია", "Category")} data-reveal="rise" style={stagger(2)}>
              <button
                type="button"
                className="text-tab"
                data-active={category === null}
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
                data-testid="filter-all"
              >
                {t("ყველა", "All")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="text-tab"
                  data-active={category === cat}
                  aria-pressed={category === cat}
                  onClick={() => {
                    hapticTap();
                    setCategory(cat);
                  }}
                  data-testid={`filter-${cat}`}
                >
                  {label(cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="gallery-empty">
            <p className="lead">
              {t(
                "ახალი ნამუშევრები მალე გამოჩნდება. მანამდე გვნახეთ Instagram-ზე.",
                "New work is on its way. Until then, find us on Instagram."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {studio.instagram && (
                <a href={studio.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                  Instagram
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  requestBooking();
                }}
                className="link-line"
                data-testid="gallery-empty-booking"
              >
                {t("დაჯავშნა", "Book a visit")}
              </button>
            </div>
          </div>
        ) : (
          <ul className="gallery-grid">
            {shown.map((image, index) => (
              <li key={image.id} style={stagger(index)}>
                <button
                  type="button"
                  className="gallery-tile"
                  data-reveal="unveil"
                  onClick={() => {
                    hapticTap();
                    setOpen(index);
                  }}
                  aria-label={`${label(image.category)} — ${t("სურათის გახსნა", "open photo")} ${index + 1}`}
                  data-testid={`gallery-image-${image.id}`}
                >
                  {isVideoUrl(image.imageUrl) ? (
                    <video src={image.imageUrl} muted loop playsInline autoPlay aria-hidden />
                  ) : (
                    <img src={image.imageUrl} alt={label(image.category)} loading="lazy" decoding="async" />
                  )}
                  <span className="gallery-tile-tag">{label(image.category)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open !== null && shown[open] && (
        <Lightbox
          images={shown}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          label={label}
        />
      )}
    </section>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  label,
}: {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  label: (cat: string) => string;
}) {
  const { t } = useLang();
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const touchX = useRef<number | null>(null);
  const image = images[index];
  const booking = CATEGORY_INFO[image.category]?.booking;

  const prev = useCallback(() => index > 0 && onIndex(index - 1), [index, onIndex]);
  const next = useCallback(() => index < images.length - 1 && onIndex(index + 1), [index, images.length, onIndex]);

  useEffect(() => {
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    lenis?.stop();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = overflow;
      (returnFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t("გალერეა", "Gallery")}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <div className="lightbox-bar">
        <span className="lightbox-count tabular-nums">
          {index + 1} / {images.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="lightbox-btn" aria-label={t("დახურვა", "Close")} data-testid="button-close-lightbox">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <figure className="lightbox-stage" key={image.id}>
        {isVideoUrl(image.imageUrl) ? (
          <video src={image.imageUrl} controls autoPlay playsInline className="lightbox-media" />
        ) : (
          <img src={image.imageUrl} alt={label(image.category)} className="lightbox-media" />
        )}
        <figcaption className="lightbox-caption">
          <span>{label(image.category)}</span>
          {booking && (
            <button
              type="button"
              className="link-line lightbox-book"
              onClick={() => {
                onClose();
                requestBooking({ category: booking });
              }}
            >
              {t("ამ სერვისის დაჯავშნა", "Book this treatment")}
            </button>
          )}
        </figcaption>
      </figure>

      <div className="lightbox-nav">
        <button type="button" onClick={prev} disabled={index === 0} className="lightbox-btn" aria-label={t("წინა", "Previous")} data-testid="button-previous-image">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={next} disabled={index === images.length - 1} className="lightbox-btn" aria-label={t("შემდეგი", "Next")} data-testid="button-next-image">
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>,
    document.body
  );
}
