import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HeroContent, SpecialOffer } from "@shared/schema";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

import { isVideoUrl } from "@/lib/videoUtils";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  const { data: heroContent } = useQuery<HeroContent>({
    queryKey: ["/api/hero-content"],
  });

  const { data: specialOffer } = useQuery<SpecialOffer | null>({
    queryKey: ["/api/special-offers/active"],
  });

  const parallaxY = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBookClick = () => {
    const bookingSection = document.getElementById('booking');
    bookingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleServicesClick = () => {
    const servicesSection = document.getElementById('services');
    servicesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="dark relative min-h-[64vh] md:min-h-screen flex items-end justify-start bg-background pt-20 md:pt-32 pb-10 md:pb-20 px-5 md:px-12 overflow-hidden overflow-x-hidden">
      {/* Brutalist Background Image (Bleeding out right) */}
      <motion.div
        className="absolute top-0 right-[-10%] w-[110%] md:w-[70%] h-full origin-top-right z-0"
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
              className="w-full h-full object-cover opacity-60 pointer-events-none"
            />
          ) : (
            <img
              src={bgSrc}
              alt="Elegant Fashion"
              className="w-full h-full object-cover opacity-60"
            />
          );
        })()}
        {/* Gradient blend with section background */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent w-[40%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent h-[40%] bottom-0 mt-auto"></div>
      </motion.div>

      {/* Massive Typographic Overlay */}
      <div className="relative z-10 w-full max-w-[100rem] mx-auto flex flex-col justify-end h-full">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* Metadata Kicker */}
          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-8 mt-4 md:mt-20">
            <span className="text-[10px] text-[var(--theme-accent)] tracking-[0.3em] uppercase font-mono border border-[var(--theme-accent)]/30 px-3 py-1 rounded-full">
              Est. 2026 // Tbilisi
            </span>
            <div className="h-px bg-[var(--theme-accent)]/30 flex-1 max-w-[100px]" />
          </div>

          {/* Brand Headline — capped on mobile, fluid on desktop */}
          <h1 className="font-display leading-[0.85] text-foreground tracking-tighter uppercase mb-8 md:mb-8 pb-2 md:pb-4 text-[clamp(2.75rem,12vw,4.5rem)] md:text-[8vw]">
            <span className="block pr-4 relative z-10 drop-shadow-2xl">THE MR</span>
            <span className="block italic font-serif text-[var(--theme-accent)] pr-4 relative z-10 drop-shadow-2xl text-[clamp(3.25rem,14vw,5.5rem)] md:text-[9vw]">Studio</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-12 pl-2 sm:pl-4 max-w-4xl">
            <motion.div>
              <p className="font-sans text-sm md:text-base text-foreground/70 font-light leading-relaxed tracking-wide border-l border-[var(--theme-accent)]/30 pl-6">
                Redefining the standard of premium<br />Nail and Laser Aesthetics.
              </p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <MagneticButton>
                <button
                  onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                  className="press-tap accent-glow w-full sm:w-auto min-h-[52px] bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-on-accent)] px-8 md:px-12 py-4 md:py-6 text-xs md:text-sm font-medium tracking-[0.18em] uppercase rounded-full transition-colors duration-300"
                >
                  დაჯავშნა
                </button>
              </MagneticButton>

              <MagneticButton>
                <button
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="press-tap w-full sm:w-auto min-h-[52px] border border-[var(--theme-accent)]/40 text-foreground hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 px-8 md:px-12 py-4 md:py-6 text-xs md:text-sm font-medium tracking-[0.18em] uppercase rounded-full transition-colors duration-300 bg-transparent"
                >
                  სერვისები
                </button>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator - Bottom Right Alignment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 right-6 md:right-12 flex flex-col items-center gap-6"
        >
          <span className="text-[10px] text-foreground/40 font-mono tracking-[0.3em] uppercase rotate-90 origin-right translate-y-8">
            Scroll
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-[var(--theme-accent)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
