import { Instagram, Facebook, Mail, Phone, MapPin, CalendarCheck } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer
      id="contact"
      className="relative scroll-mt-20 app-section md:scroll-mt-24"
    >
      <div className="app-shell">
        <div className="space-y-4">
          {/* About */}
          <div className="app-card p-5">
            <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--theme-text)] mb-1">
              <span className="opacity-55 font-normal">THE </span>
              MR
              <span className="font-serif italic font-normal text-[var(--theme-accent)] ml-0.5">Studio</span>
            </h3>
            <p className="font-serif italic text-[14px] leading-relaxed text-[var(--theme-muted1)]">
              {t(
                "სადაც დახვეწილი ელეგანტურობა თანამედროვე სიზუსტეს ხვდება.",
                "Where refined elegance meets modern precision."
              )}
            </p>

            <button
              onClick={() => {
                hapticTap();
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="pill-primary w-full mt-4"
              data-testid="footer-booking-cta"
            >
              <CalendarCheck className="w-4 h-4" strokeWidth={2} />
              {t("დაჯავშნა", "Book appointment")}
            </button>
          </div>

          {/* Contact */}
          <div className="app-list">
            <a
              href="tel:+995551287555"
              className="app-row press-tap"
              data-testid="footer-phone"
            >
              <div className="w-10 h-10 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[var(--theme-muted1)]" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[var(--theme-muted1)]">{t("ტელეფონი", "Phone")}</div>
                <div className="text-[14.5px] font-medium text-[var(--theme-text)] tabular-nums">
                  +995 551 287 555
                </div>
              </div>
            </a>

            <a
              href="mailto:Studiomrmr1@gmail.com"
              className="app-row press-tap"
              data-testid="footer-email"
            >
              <div className="w-10 h-10 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[var(--theme-muted1)]" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[var(--theme-muted1)]">{t("ელ. ფოსტა", "Email")}</div>
                <div className="text-[14.5px] font-medium text-[var(--theme-text)] truncate">
                  Studiomrmr1@gmail.com
                </div>
              </div>
            </a>

            <a
              href="https://maps.google.com/?q=%E1%83%95%E1%83%94%E1%83%A4%E1%83%AE%E1%83%98%E1%83%A1%E1%83%A2%E1%83%A7%E1%83%90%E1%83%9D%E1%83%A1%E1%83%9C%E1%83%98%E1%83%A1%2020/22,%20%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98"
              target="_blank"
              rel="noopener noreferrer"
              className="app-row press-tap"
              data-testid="footer-address"
            >
              <div className="w-10 h-10 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-soft)_25%,transparent)] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[var(--theme-muted1)]" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[var(--theme-muted1)]">{t("მისამართი", "Address")}</div>
                <div className="text-[14.5px] font-medium text-[var(--theme-text)]">
                  {t(
                    "დიდი დიღომი, ვეფხისტყაოსნის 22/24, თბილისი",
                    "Didi Dighomi, Vepkhistkaosani 22/24, Tbilisi"
                  )}
                </div>
              </div>
            </a>
          </div>

          {/* Map */}
          <a
            href="https://maps.google.com/?q=%E1%83%95%E1%83%94%E1%83%A4%E1%83%AE%E1%83%98%E1%83%A1%E1%83%A2%E1%83%A7%E1%83%90%E1%83%9D%E1%83%A1%E1%83%9C%E1%83%98%E1%83%A1%2020/22,%20%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open MR Studio location in Google Maps"
            className="block w-full h-[180px] rounded-2xl overflow-hidden border border-[var(--theme-line)]/60 relative group shadow-[var(--ios-shadow-1)]"
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
              className="pointer-events-none transition-all duration-700 group-hover:opacity-100 opacity-90"
            />
          </a>

          {/* Social */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <a
              href="https://www.instagram.com/studiomariamisnail?igsh=N3RvYTE3dXBnZ29v&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-instagram"
              className="press-tap w-10 h-10 rounded-full flex items-center justify-center bg-[var(--theme-surface)] border border-[var(--theme-line)]/70 text-[var(--theme-muted1)] hover:text-[var(--theme-accent)] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61566420489825"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-facebook"
              className="press-tap w-10 h-10 rounded-full flex items-center justify-center bg-[var(--theme-surface)] border border-[var(--theme-line)]/70 text-[var(--theme-muted1)] hover:text-[var(--theme-accent)] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="mailto:Studiomrmr1@gmail.com"
              data-testid="button-email"
              className="press-tap w-10 h-10 rounded-full flex items-center justify-center bg-[var(--theme-surface)] border border-[var(--theme-line)]/70 text-[var(--theme-muted1)] hover:text-[var(--theme-accent)] transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Legal */}
          <div className="text-center pt-2 pb-2">
            <p className="text-[11px] text-[var(--theme-muted1)]/70">
              {t("© 2026 THE MR Nail & Laser Studio", "© 2026 THE MR Nail & Laser Studio")}
            </p>
            <p className="text-[10px] text-[var(--theme-muted1)]/40 mt-1">Site by Nina</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
