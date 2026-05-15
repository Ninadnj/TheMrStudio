import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, ArrowRight } from "lucide-react";
import type { HeroContent } from "@shared/schema";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

import { isVideoUrl } from "@/lib/videoUtils";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLang();
  const { data: heroContent } = useQuery<HeroContent>({
    queryKey: ["/api/hero-content"],
  });

  const bgSrc = heroContent?.backgroundImage || heroBackground;
  const isVideo = isVideoUrl(bgSrc);

  return (
    <section
      id="hero"
      className="relative pt-20 md:pt-24 pb-10 md:pb-14"
    >
      <div className="app-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Hero card — image with elegant text overlay (poster-style) */}
          <div className="editorial-grain relative overflow-hidden rounded-[28px] border border-[var(--theme-line)] bg-[var(--theme-ink)] shadow-[var(--ios-shadow-2)]">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] w-full">
              {isVideo ? (
                <video
                  src={bgSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={bgSrc}
                  alt="THE MR Studio"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Stage gradient — readable text without burying the photo */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(16,22,16,0.0) 0%, rgba(16,22,16,0.0) 38%, rgba(16,22,16,0.42) 64%, rgba(16,22,16,0.78) 100%)",
                }}
              />

              {/* Top eyebrow — hairline meta */}
              <div className="absolute top-5 left-5 right-5 flex items-center gap-2.5">
                <span className="block h-px w-7 bg-white/70" />
                <span className="text-[10.5px] font-medium tracking-[0.22em] uppercase text-white/85">
                  {t("თბილისი · 2026", "Tbilisi · Est. 2026")}
                </span>
              </div>

              {/* Bottom: headline */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-6 sm:pb-6">
                <h1 className="font-sans text-[2.1rem] sm:text-[2.4rem] md:text-[2.6rem] leading-[1.02] tracking-[-0.025em] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                  <span className="opacity-65 font-light">THE </span>
                  <span>MR</span>
                  <span className="font-serif italic font-normal text-[var(--theme-soft)] ml-0.5">
                    Studio
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Single primary CTA + secondary text link */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                hapticTap();
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="pill-primary w-full"
              data-testid="hero-cta-book"
            >
              <CalendarCheck className="w-[18px] h-[18px]" strokeWidth={2} />
              {t("დაჯავშნა", "Book appointment")}
            </button>

            <button
              onClick={() => {
                hapticTap();
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-1.5 self-center text-[14px] font-medium text-[var(--theme-muted1)] hover:text-[var(--theme-text)] transition-colors press-tap py-2"
              data-testid="hero-cta-services"
            >
              {t("სერვისების ნახვა", "Browse services")}
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
