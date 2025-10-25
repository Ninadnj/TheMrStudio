import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
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
      {/* Warm Neutral Gradient Background (2025) */}
      <div className="absolute inset-0 animated-gradient" style={{ background: 'linear-gradient(135deg, #3A352E 0%, #4A3F35 50%, #3A352E 100%)' }} />
      
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        <motion.img 
          src={heroBackground}
          alt="Elegant Fashion"
          className="w-full h-full object-cover opacity-85"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ scale }}
        />
        {/* Gradient overlay - darker at top for header visibility, lighter in center for photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/40"></div>
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
          x: mousePosition.x,
          y: mousePosition.y,
          opacity
        }}
      >
        {/* Bold, Minimalist Typography (2025 Design) */}
        <motion.h1 
          className="font-display text-7xl md:text-8xl lg:text-9xl font-bold mb-8 text-white leading-none" 
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Precision<br/>
          Beauty.
        </motion.h1>
        
        <motion.p 
          className="font-sans text-2xl md:text-3xl mb-6 font-light text-white/90" 
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
        
        <motion.p 
          className="text-lg md:text-xl max-w-lg mx-auto mb-14 leading-relaxed text-white/85 font-light" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          პროფესიონალური ფრჩხილები და ლაზერული პროცედურები<br/>
          <span className="text-sm text-white/70">Professional nail art & laser treatments</span>
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Button 
            size="lg"
            className="bg-theme-accent min-w-[200px] font-medium tracking-wide magnetic-button ripple-effect"
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
