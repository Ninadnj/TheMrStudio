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
    <section className="relative min-h-screen flex items-end justify-start bg-theme pt-32 pb-20 px-6 md:px-12 overflow-hidden overflow-x-hidden">
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
        {/* Harsh Gradient cutoff to blend with Obsidian */}
        <div className="absolute inset-0 bg-gradient-to-r from-theme-bg via-theme-bg/50 to-transparent w-[40%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/80 to-transparent h-[40%] bottom-0 mt-auto"></div>
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
          <div className="flex items-center gap-6 mb-8">
            <span className="text-[10px] text-[var(--theme-accent)] tracking-[0.3em] uppercase font-mono border border-[var(--theme-accent)]/30 px-3 py-1">
              Est. 2026 // Tbilisi
            </span>
            <div className="h-px bg-[var(--theme-accent)]/30 flex-1 max-w-[100px]" />
          </div>

          {/* Brutalist Headline */}
          <h1 className="font-display text-[12vw] md:text-[9vw] leading-[0.8] text-[#fafafa] tracking-tighter uppercase mix-blend-difference mb-12 sm:mb-8 pb-4">
            <span className="block pr-4">THE MR</span>
            <span className="block italic text-[15vw] md:text-[11vw] font-serif text-[var(--theme-accent)] pr-4">Studio</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-12 pl-2 sm:pl-4 max-w-4xl">
            <motion.div>
              <p className="font-sans text-sm md:text-base text-[#fafafa]/60 font-light leading-relaxed tracking-wide border-l border-[var(--theme-accent)]/30 pl-6">
                Redefining the standard of premium<br />Nail and Laser Aesthetics.
              </p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <MagneticButton>
                <button
                  onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full sm:w-auto bg-[var(--theme-accent)] hover:bg-[#fafafa] hover:text-theme-bg text-theme-bg px-10 md:px-12 py-7 md:py-8 text-xs md:text-sm font-mono tracking-[0.2em] uppercase rounded-none transition-colors duration-500"
                >
                  დაჯავშნა
                </button>
              </MagneticButton>

              <MagneticButton>
                <button
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full sm:w-auto border-[var(--theme-accent)]/30 text-[#fafafa] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 px-10 md:px-12 py-7 md:py-8 text-xs md:text-sm font-mono tracking-[0.2em] uppercase rounded-none transition-colors duration-500 bg-transparent"
                >
                  მენიუ
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
          <span className="text-[10px] text-[#fafafa]/40 font-mono tracking-[0.3em] uppercase rotate-90 origin-right translate-y-8">
            Scroll
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-[var(--theme-accent)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
