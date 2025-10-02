import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/549364704_122179318094547349_828276851018343606_n_1759441251850.jpg";

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
    <section className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E6E3' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/6" />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="mb-10 inline-block">
          <div className="w-56 h-56 mx-auto mb-8 flex items-center justify-center relative">
            <div className="w-full h-full rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
              <img 
                src={logoImage} 
                alt="THE MR Nail & Laser Studio" 
                className="w-[120%] h-[120%] object-cover"
              />
            </div>
          </div>
        </div>
        
        <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground font-light" style={{ letterSpacing: '0.05em' }}>
          <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic', fontWeight: 300, opacity: 0.6 }}>THE</span> <span className="font-medium">MR</span> NAIL & LASER STUDIO
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 tracking-wide uppercase text-sm md:text-base font-light">
          Where Beauty Meets Precision
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Expert nail artistry and advanced laser treatments in an elegant, modern setting
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent border-primary-border text-primary-foreground min-w-[200px] font-medium tracking-wide"
            onClick={handleBookClick}
            data-testid="button-book-appointment"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="min-w-[200px] font-medium tracking-wide backdrop-blur-sm"
            onClick={handleServicesClick}
            data-testid="button-view-services"
          >
            View Services
          </Button>
        </div>
      </div>
    </section>
  );
}
