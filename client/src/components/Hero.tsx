import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, List } from "lucide-react";
import type { HeroContent } from "@shared/schema";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

import { isVideoUrl } from "@/lib/videoUtils";

export default function Hero() {
  const { scrollY } = useScroll();

  const { data: heroContent } = useQuery<HeroContent>({
    queryKey: ["/api/hero-content"],
  });

  const parallaxY = useTransform(scrollY, [0, 1000], [0, 180]);

  return (
    <section className="dark relative min-h-[92svh] md:min-h-[92vh] flex items-end justify-start bg-background pt-24 md:pt-32 pb-28 md:pb-16 px-5 md:px-12 overflow-hidden overflow-x-hidden">
      <motion.div
        className="absolute top-0 right-0 w-full md:w-[74%] h-full origin-top-right z-0"
        style={{ y: parallaxY }}
      >
        {(() => {
          const bgSrc = heroContent?.backgroundImage || heroBackground;
          return isVideoUrl(bgSrc) ? (
            <video
              src={bgSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-58 md:opacity-72 pointer-events-none"
            />
          ) : (
            <img
              src={bgSrc}
              alt="THE MR Studio beauty aesthetic"
              className="w-full h-full object-cover opacity-58 md:opacity-72"
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/82 md:via-background/36 to-transparent md:w-[58%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 md:via-background/55 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_78%,rgba(191,207,187,0.16),transparent_34%)]" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-end h-full">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="flex items-center gap-3 md:gap-5 mb-4 md:mb-8 mt-4 md:mt-20">
            <span className="text-[10px] text-[var(--theme-accent)] uppercase font-mono border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 px-3 py-1.5 rounded-full">
              Est. 2026 / Tbilisi
            </span>
            <div className="h-px bg-[var(--theme-accent)]/30 flex-1 max-w-[100px]" />
          </div>

          <h1 className="font-display leading-none text-foreground tracking-normal uppercase mb-5 md:mb-8 pb-2 md:pb-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="block pr-4 relative z-10 drop-shadow-2xl">THE MR</span>
            <span className="block italic font-serif text-[var(--theme-accent)] pr-4 relative z-10 drop-shadow-2xl normal-case">Studio</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-12 pl-0 sm:pl-4 max-w-4xl">
            <motion.div className="rounded-[8px] border border-[var(--theme-accent)]/24 bg-[rgba(16,22,16,0.58)] px-4 py-3 backdrop-blur-md md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0">
              <p className="font-sans text-sm md:text-base text-[var(--theme-cream)]/92 font-light leading-relaxed border-l border-[var(--theme-accent)]/65 pl-4 md:pl-6">
                Redefining the standard of premium<br />Nail and Laser Aesthetics.
              </p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-xl">
              <MagneticButton>
                <button
                  onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                  className="press-tap accent-glow w-full sm:w-auto min-h-[54px] bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] px-7 md:px-12 py-4 md:py-6 text-sm font-medium rounded-full transition-colors duration-300 inline-flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" strokeWidth={1.8} />
                  დაჯავშნა
                </button>
              </MagneticButton>

              <MagneticButton>
                <button
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="press-tap w-full sm:w-auto min-h-[54px] border border-[var(--theme-accent)]/45 text-foreground hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 px-7 md:px-12 py-4 md:py-6 text-sm font-medium rounded-full transition-colors duration-300 bg-background/18 backdrop-blur-sm inline-flex items-center justify-center gap-2"
                >
                  <List className="w-4 h-4" strokeWidth={1.8} />
                  სერვისები
                </button>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 right-3 md:right-8 hidden sm:flex flex-col items-center gap-6"
        >
          <span className="text-[10px] text-foreground/40 font-mono uppercase rotate-90 origin-right translate-y-8">
            Scroll
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-[var(--theme-accent)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
