import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HeroContent, SpecialOffer } from "@shared/schema";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm gradient background - Using warm taupe tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1410] to-[#2A221C]" />
      
      {/* Background Image with Parallax - Subtle atmospheric effect */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        <motion.img 
          src={heroContent?.backgroundImage || heroBackground}
          alt="Elegant Fashion"
          className="w-full h-full object-cover opacity-30"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ scale }}
        />
        {/* Warm overlay for elegant atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/35"></div>
      </motion.div>
      
      {/* Subtle Noise/Grain Overlay (2025 Design Brief) */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px'
      }} />
      
      <motion.div 
        className="relative max-w-5xl mx-auto px-6 text-center"
        style={{ 
          opacity
        }}
      >
        {/* Bold, Minimalist Typography (2025 Design) */}
        <motion.h1 
          className="font-display text-7xl md:text-8xl lg:text-9xl mb-8 text-white leading-none" 
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span style={{ opacity: 0.3 }}>THE </span>
          <span>MR</span>
          <br/>
          <span style={{ opacity: 0.3 }}>Studio</span>
        </motion.h1>
        
        <motion.p 
          className="font-sans text-xl md:text-2xl mb-6 font-light text-white/90" 
          style={{ letterSpacing: '0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Minimal effort.
        </motion.p>
        
        <motion.div 
          className="w-24 h-1 mx-auto mb-10 bg-theme-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        
        {specialOffer ? (
          <motion.div 
            className="text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed text-white/90 font-light text-center" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            data-testid="hero-special-offer"
          >
            {specialOffer.link ? (
              <a 
                href={specialOffer.link} 
                className="hover:text-theme-accent transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {specialOffer.message}
              </a>
            ) : (
              <span>{specialOffer.message}</span>
            )}
          </motion.div>
        ) : (
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed text-white/85 font-light text-center" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            პროფესიონალური ფრჩხილები და ლაზერული პროცედურები<br/>
            <span className="text-base text-white/70">Professional nail art & laser treatments</span>
          </motion.p>
        )}
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Button 
            size="lg"
            className="bg-theme-accent text-white min-w-[200px] font-medium tracking-wide magnetic-button ripple-effect shadow-lg"
            style={{ backgroundColor: 'var(--theme-accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-accent)'}
            onClick={handleBookClick}
            data-testid="button-book-appointment"
          >
            <Calendar className="w-4 h-4 mr-2" />
            დაჯავშნა
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="min-w-[200px] font-medium tracking-wide backdrop-blur-sm border-white/60 text-white hover:bg-white/10 magnetic-button"
            onClick={handleServicesClick}
            data-testid="button-view-services"
          >
            სერვისები
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
