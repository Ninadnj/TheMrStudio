import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
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
              Expert beauty and wellness treatments in an elegant, modern setting. We're dedicated to helping you look and feel your best.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-white">Quick Links</h4>
            <div className="space-y-2">
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-about"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                About Us
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-services"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                Our Services
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-gallery"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                Gallery
              </button>
              <button 
                className="block text-sm transition-colors" 
                style={{ color: 'rgba(255,255,255,0.8)' }}
                data-testid="footer-link-booking"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                Book Appointment
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  123 Beauty Lane, Suite 100<br />New York, NY 10001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  hello@mrstudio.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2025 THE MR Nail & Laser Studio. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" data-testid="button-instagram" style={{ color: 'white' }}>
              <Instagram className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-facebook" style={{ color: 'white' }}>
              <Facebook className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-email" style={{ color: 'white' }}>
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-center pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-sm" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}>
            Created by DNJ™ with 🤍 &☕
          </p>
        </div>
      </div>
    </footer>
  );
}
