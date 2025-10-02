import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(155,135,188,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(228,170,165,0.1),transparent_50%)]" />
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="mb-8 inline-block">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <div className="font-serif text-4xl text-foreground">MR</div>
          </div>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-foreground tracking-tight">
          MR NAIL & LASER STUDIO
        </h1>
        
        <p className="font-serif text-xl md:text-2xl text-muted-foreground mb-4 italic">
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
