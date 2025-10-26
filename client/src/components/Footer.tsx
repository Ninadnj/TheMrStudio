import { Instagram, Facebook, Mail, Phone, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer id="contact" className="relative py-16 lg:py-20 bg-background">
      {/* Warm Taupe Accent Line (2025 Design Brief) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--theme-accent)] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-sans text-2xl mb-4 text-foreground" style={{ letterSpacing: '0.05em' }}>
              <span style={{ opacity: 0.6 }}>The</span> <span className="font-medium">MR</span> Studio
            </h3>
            <p className="text-sm leading-relaxed tracking-wide text-muted-foreground">
              Where timeless elegance meets modern precision. Your destination for expert nail artistry and advanced laser treatments.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">სწრაფი ბმულები</h4>
            <div className="space-y-2">
              <button 
                className="block text-sm transition-colors hover:text-theme-accent text-muted-foreground" 
                data-testid="footer-link-about"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                ჩვენს შესახებ
              </button>
              <button 
                className="block text-sm transition-colors hover:text-theme-accent text-muted-foreground" 
                data-testid="footer-link-services"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                ჩვენი სერვისები
              </button>
              <button 
                className="block text-sm transition-colors hover:text-theme-accent text-muted-foreground" 
                data-testid="footer-link-gallery"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                გალერეა
              </button>
              <button 
                className="block text-sm transition-colors hover:text-theme-accent text-muted-foreground" 
                data-testid="footer-link-booking"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                დაჯავშნა
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4">საკონტაქტო ინფორმაცია</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">
                  დიდი დიღომი ასმათის 8<br />თბილისი, საქართველო
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">
                  +995 551 287 555
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">
                  Studiomrmr1@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 THE MR Nail & Laser Studio. All Rights Reserved.
          </p>
          
          {/* Social Icons with Hover Fade (2025 Design Brief) */}
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              data-testid="button-instagram" 
              className="text-foreground hover:text-theme-accent transition-all duration-300"
              asChild
            >
              <a href="https://www.instagram.com/studiomariamisnail?igsh=N3RvYTE3dXBnZ29v&utm_source=qr" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4" />
              </a>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              data-testid="button-facebook" 
              className="text-foreground hover:text-theme-accent transition-all duration-300"
              asChild
            >
              <a href="https://www.facebook.com/profile.php?id=61566420489825" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-4 h-4" />
              </a>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              data-testid="button-email" 
              className="text-foreground hover:text-theme-accent transition-all duration-300"
              asChild
            >
              <a href="mailto:Studiomrmr1@gmail.com">
                <Mail className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
        
        <div className="text-center pt-6 mt-6 border-t border-border">
          <p className="text-base flex items-center justify-center gap-1.5 text-muted-foreground" style={{ fontFamily: 'Raleway, sans-serif' }}>
            <span className="opacity-30">Created by</span>{' '}
            <span>The</span>{' '}
            <span>DNJ™</span>{' '}
            <span className="opacity-30">with</span>{' '}
            🤍
            {' '}
            <span className="opacity-30">&</span>
            {' '}
            <Coffee className="w-4 h-4" />
          </p>
        </div>
      </div>
    </footer>
  );
}
