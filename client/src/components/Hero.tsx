import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import type { HeroContent } from "@shared/schema";

import { isVideoUrl } from "@/lib/videoUtils";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking } from "@/lib/serviceMenu";
import { scrollBehavior } from "@/lib/motion";
import { useStudio } from "@/lib/studio";

/** Default hero art, pre-sized as WebP and preloaded in index.html. Admin uploads override it. */
const DEFAULT_HERO = {
  src: "/images/hero-1024.webp",
  srcSet: "/images/hero-512.webp 512w, /images/hero-768.webp 768w, /images/hero-1024.webp 1024w",
  sizes: "(min-width: 1024px) 42vw, 100vw",
};

export default function Hero() {
  const { t, lang } = useLang();
  const studio = useStudio();
  const { data: heroContent, isPending } = useQuery<Pick<HeroContent, "backgroundImage">>({
    queryKey: ["/api/hero-content"],
  });

  // Wait for the (tiny) answer before drawing, so an uploaded image never flashes in over the default art.
  // The figure keeps its size meanwhile; the default art is already preloaded, so it paints at once.
  const customMedia = heroContent?.backgroundImage || null;
  const mediaSrc = customMedia || DEFAULT_HERO.src;
  const isVideo = isVideoUrl(mediaSrc);

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero-grid shell">
        <figure className="hero-media">
          {isPending ? null : isVideo ? (
            <video src={mediaSrc} autoPlay loop muted playsInline aria-hidden className="hero-media-el" />
          ) : (
            <img
              src={mediaSrc}
              srcSet={customMedia ? undefined : DEFAULT_HERO.srcSet}
              sizes={customMedia ? undefined : DEFAULT_HERO.sizes}
              alt={t("THE MR Studio — სტუდიის ესთეტიკა", "THE MR Studio — studio mood")}
              className="hero-media-el"
              width={1024}
              height={1024}
              // React 18 only passes the lowercase attribute through
              {...{ fetchpriority: "high" }}
              decoding="async"
            />
          )}
        </figure>

        {/* On phones this block sits over the image; on desktop it heads the copy column */}
        <div className="hero-head">
          <p className="eyebrow hero-eyebrow hero-rise" style={{ animationDelay: "120ms" }}>
            {lang === "ka" ? studio.address.ka : studio.address.en}
          </p>

          {/* The studio's name is the headline — the same in both languages */}
          <h1 id="hero-title" className="hero-title" aria-label="THE MR Studio">
            <span className="hero-line">
              <span style={{ animationDelay: "60ms" }}>
                <span className="wordmark">
                  <span className="wordmark-the">THE</span>
                  <span className="wordmark-mr">MR</span>
                  <span className="wordmark-studio">Studio</span>
                </span>
              </span>
            </span>
          </h1>
        </div>

        <div className="hero-body">
          <div className="hero-actions hero-rise" style={{ animationDelay: "320ms" }}>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                requestBooking();
              }}
              className="pill-primary"
              data-testid="hero-cta-book"
            >
              {t("დაჯავშნა", "Book appointment")}
            </button>
            <a
              href="#prices"
              onClick={(e) => {
                e.preventDefault();
                hapticTap();
                document.getElementById("prices")?.scrollIntoView({ behavior: scrollBehavior() });
              }}
              className="link-line"
              data-testid="hero-view-prices"
            >
              {t("ფასების ნახვა", "View prices")}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
