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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/12 via-accent/8 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(130,200,160,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(150,210,180,0.08),transparent_50%)]" />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="mb-10 inline-block">
          <div className="w-56 h-56 mx-auto mb-8 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-2xl"></div>
            <img 
              src={logoImage} 
              alt="MR Nail & Laser Studio" 
              className="w-full h-full object-contain relative z-10"
            />
          </div>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-foreground tracking-tight font-normal">
          MR NAIL & LASER STUDIO
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
