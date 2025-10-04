import { Instagram, Facebook, Mail, Phone, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer id="contact" className="py-16 lg:py-20" style={{ backgroundColor: 'var(--theme-accent)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-sans text-2xl mb-4 text-white" style={{ letterSpacing: '0.05em' }}>
              <span style={{ opacity: 0.6 }}>The</span> <span className="font-medium">MR</span> Studio
            </h3>
            <p className="text-sm leading-relaxed tracking-wide" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Where timeless elegance meets modern precision. Your destination for expert nail artistry and advanced laser treatments.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-white">სწრაფი ბმულები</h4>
            <div className="space-y-2">
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-about"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                ჩვენს შესახებ
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-services"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                ჩვენი სერვისები
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-gallery"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                გალერეა
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-booking"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                დაჯავშნა
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">საკონტაქტო ინფორმაცია</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  დიდი დიღომი ასმათის 8<br />თბილისი, საქართველო
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  +995 551 287 555
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Studiomrmr1@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2025 THE MR Nail & Laser Studio. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              data-testid="button-instagram" 
              style={{ color: 'white' }}
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
              style={{ color: 'white' }}
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
              style={{ color: 'white' }}
              asChild
            >
              <a href="mailto:Studiomrmr1@gmail.com">
                <Mail className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
        
        <div className="text-center pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-sm flex items-center justify-center gap-1.5" style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ opacity: 0.3 }}>Created by</span>{' '}
            <span className="font-bold">The</span>{' '}
            <span className="font-bold">DNJ™</span>{' '}
            <span style={{ opacity: 0.3 }}>with</span>{' '}
            🤍{' '}
            <span style={{ opacity: 0.3 }}>&</span>{' '}
            <Coffee className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.8)' }} />
          </p>
        </div>
      </div>
    </footer>
  );
}
