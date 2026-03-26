import { Instagram, Facebook, Mail, Phone, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/components/MagneticButton";

export default function Footer() {
  return (
    <footer id="contact" className="relative py-16 lg:py-20 bg-background">
      {/* Brutalist Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--theme-accent)]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-sans text-2xl mb-4 text-foreground" style={{ letterSpacing: '0.05em' }}>
              <span style={{ opacity: 0.6 }}>The</span> <span className="font-medium">MR</span> Studio
            </h3>
            <p className="text-sm leading-relaxed tracking-wide text-muted-foreground">
              Where refined elegance meets modern precision.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">სწრაფი ბმულები</h4>
            <div className="space-y-2">
              <button
                className="block text-sm transition-colors text-muted-foreground link-underline opacity-60 hover:opacity-100"
                data-testid="footer-link-about"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                ჩვენს შესახებ
              </button>
              <button
                className="block text-sm transition-colors text-muted-foreground link-underline opacity-60 hover:opacity-100"
                data-testid="footer-link-services"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                ჩვენი სერვისები
              </button>
              <button
                className="block text-sm transition-colors text-muted-foreground link-underline opacity-60 hover:opacity-100"
                data-testid="footer-link-gallery"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                გალერეა
              </button>
              <button
                className="block text-sm transition-colors text-muted-foreground link-underline opacity-60 hover:opacity-100"
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
                  დიდი დიღომი, ვეფხისტყაოსნის 22/24. <br />თბილისი, საქართველო
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

            {/* Live Google Map */}
            <a
              href="https://maps.google.com/?q=%E1%83%95%E1%83%94%E1%83%A4%E1%83%AE%E1%83%98%E1%83%A1%E1%83%A2%E1%83%A7%E1%83%90%E1%83%9D%E1%83%A1%E1%83%9C%E1%83%98%E1%83%A1%2020/22,%20%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open MR Studio location in Google Maps"
              className="mt-8 block w-full h-[180px] rounded-none overflow-hidden border border-border/40 relative group"
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                referrerPolicy="no-referrer"
                loading="lazy"
                src="https://maps.google.com/maps?q=%E1%83%95%E1%83%94%E1%83%A4%E1%83%AE%E1%83%98%E1%83%A1%E1%83%A2%E1%83%A7%E1%83%90%E1%83%9D%E1%83%A1%E1%83%9C%E1%83%98%E1%83%A1%2020/22,%20%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98&t=&z=15&ie=UTF8&iwloc=&output=embed"
                title="MR Studio Location"
                className="pointer-events-none grayscale-[0.5] opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 THE MR Nail & Laser Studio. ყველა უფლება დაცულია.
          </p>

          {/* Social Icons with Hover Fade (2025 Design Brief) */}
          <div className="flex items-center gap-2">
            <MagneticButton>
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
            </MagneticButton>

            <MagneticButton>
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
            </MagneticButton>

            <MagneticButton>
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
            </MagneticButton>
          </div>
        </div>

        <div className="text-center pt-8 mt-8 border-t border-border/40">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity duration-500 font-sans">
            Site by Nina
          </p>
        </div>
      </div>
    </footer>
  );
}
