import { Instagram, Facebook, Mail, Phone, MapPin, Copyright, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/components/MagneticButton";

export default function Footer() {
  return (
    <footer id="contact" className="relative scroll-mt-24 py-16 md:scroll-mt-28 lg:py-20 bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent)]/70 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 mb-12">
          <div className="flex flex-col justify-between gap-8">
            <div>
            <h3 className="font-display text-3xl mb-4 text-foreground tracking-normal">
              <span style={{ opacity: 0.6 }}>The</span> <span className="font-medium">MR</span> Studio
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Where refined elegance meets modern precision.
            </p>
            </div>

            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="press-tap accent-glow inline-flex w-fit items-center gap-2 rounded-full bg-[var(--theme-accent)] px-5 py-3 text-sm font-medium text-[var(--theme-on-accent)] transition-colors hover:bg-[var(--theme-accent-hover)]"
              data-testid="footer-booking-cta"
            >
              <CalendarCheck className="w-4 h-4" strokeWidth={1.8} />
              დაჯავშნა
            </button>
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
              className="mt-8 block w-full h-[180px] rounded-[8px] overflow-hidden border border-border/60 relative group shadow-sm"
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
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
            <Copyright className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeWidth={1.6} />
            <span>2026 THE MR Nail &amp; Laser Studio. ყველა უფლება დაცულია.</span>
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
          <p className="text-[10px] tracking-normal uppercase opacity-40 hover:opacity-100 transition-opacity duration-500 font-sans">
            Site by Nina
          </p>
        </div>
      </div>
    </footer>
  );
}
