import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-card-border py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-sans text-2xl text-card-foreground mb-4" style={{ letterSpacing: '0.05em' }}>
              <span style={{ fontFamily: 'Allura, cursive', fontWeight: 400, opacity: 0.6 }}>THE</span> <span className="font-medium">MR</span> Studio
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed tracking-wide">
              Expert beauty and wellness treatments in an elegant, modern setting. We're dedicated to helping you look and feel your best.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-card-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">
                About Us
              </button>
              <button className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-services">
                Our Services
              </button>
              <button className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-gallery">
                Gallery
              </button>
              <button className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-booking">
                Book Appointment
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-card-foreground mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  123 Beauty Lane, Suite 100<br />New York, NY 10001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  hello@mrstudio.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-card-border gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 THE MR Nail & Laser Studio. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" data-testid="button-instagram">
              <Instagram className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-facebook">
              <Facebook className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-email">
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-center pt-6 border-t border-card-border mt-6">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300 }}>
            Created by DNJ™ with 🤍 &☕
          </p>
        </div>
      </div>
    </footer>
  );
}
