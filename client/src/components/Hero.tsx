import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@assets/dnj0209_Stylized_illustration_of_a_fashionable_woman_wearing__c8336757-5e7e-4c3b-8d06-de464e7c4e40_1_1759491029908.png";

export default function Hero() {
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
      {/* Background Image with Dark Wash */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground}
          alt="Elegant Fashion"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85"></div>
      </div>
      
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)' }} />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="mb-12 inline-block">
          <div className="mb-8">
            <h1 className="font-sans text-6xl md:text-7xl lg:text-8xl font-light text-white" style={{ letterSpacing: '0.08em' }}>
              <span style={{ opacity: 0.3, fontWeight: 300 }}>THE </span>
              <span className="font-bold">MR</span>
            </h1>
          </div>
        </div>
        
        <h2 className="font-sans text-xl md:text-2xl mb-6 font-light text-white tracking-widest uppercase" style={{ opacity: 0.7 }}>
          Nail & Laser Studio
        </h2>
        
        <p className="text-xl md:text-2xl mb-4 tracking-wide uppercase text-sm md:text-base font-light text-white" style={{ opacity: 0.85 }}>
          Where Beauty Meets Precision
        </p>
        
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed text-white" style={{ opacity: 0.85 }}>
          Timeless Elegance, Modern Excellence
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-theme-accent min-w-[200px] font-medium tracking-wide"
            onClick={handleBookClick}
            data-testid="button-book-appointment"
          >
            <Calendar className="w-4 h-4 mr-2" />
            დაჯავშნა
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="min-w-[200px] font-medium tracking-wide backdrop-blur-sm border-white/80 text-white hover:bg-white/10"
            onClick={handleServicesClick}
            data-testid="button-view-services"
          >
            სერვისები
          </Button>
        </div>
      </div>
    </section>
  );
}
