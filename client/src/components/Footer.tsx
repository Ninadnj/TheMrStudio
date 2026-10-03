import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking } from "@/lib/serviceMenu";
import { useStudio } from "@/lib/studio";
import { stagger } from "@/lib/reveal";

export default function Footer() {
  const { t, lang } = useLang();
  const studio = useStudio();

  // Google Maps is heavy: mount it only when the visitor scrolls close to it
  const mapRef = useRef<HTMLAnchorElement>(null);
  const [showMap, setShowMap] = useState(false);
  useEffect(() => {
    const el = mapRef.current;
    if (!el || showMap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showMap]);

  return (
    <footer id="contact" className="site-footer scroll-mt-20 md:scroll-mt-24" aria-labelledby="contact-title">
      <div className="shell footer-grid">
        <div className="footer-signoff">
          <h2 id="contact-title" className="eyebrow" data-reveal="rise">
            {t("კონტაქტი", "Contact")}
          </h2>
          <div className="footer-actions" data-reveal="rise" style={stagger(1)}>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                requestBooking();
              }}
              className="pill-primary"
              data-testid="footer-booking-cta"
            >
              {t("დაჯავშნა", "Book appointment")}
            </button>
            <a
              href={studio.whatsappLink(t("გამარჯობა! მაქვს კითხვა.", "Hi, I have a question."))}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line"
            >
              WhatsApp
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <dl className="footer-info" data-reveal="rise" style={stagger(2)}>
          <div>
            <dt>{t("მისამართი", "Address")}</dt>
            <dd>
              <a href={studio.mapUrl} target="_blank" rel="noopener noreferrer" data-testid="footer-address">
                {lang === "ka" ? studio.address.ka : studio.address.en}
              </a>
            </dd>
          </div>
          {studio.hours && (
            <div>
              <dt>{t("სამუშაო საათები", "Hours")}</dt>
              <dd>{lang === "ka" ? studio.hours.ka : studio.hours.en}</dd>
            </div>
          )}
          <div>
            <dt>{t("ტელეფონი", "Phone")}</dt>
            <dd>
              <a href={studio.phone.href} className="tabular-nums" data-testid="footer-phone">
                {studio.phone.display}
              </a>
            </dd>
          </div>
          <div>
            <dt>{t("ელ. ფოსტა", "Email")}</dt>
            <dd>
              <a href={`mailto:${studio.email}`} data-testid="footer-email">
                {studio.email}
              </a>
            </dd>
          </div>
          {(studio.instagram || studio.facebook) && (
          <div>
            <dt>{t("გამოგვყევით", "Follow")}</dt>
            <dd className="footer-social">
              {studio.instagram && (
                <a href={studio.instagram} target="_blank" rel="noopener noreferrer" data-testid="button-instagram">
                  Instagram
                </a>
              )}
              {studio.facebook && (
                <a href={studio.facebook} target="_blank" rel="noopener noreferrer" data-testid="button-facebook">
                  Facebook
                </a>
              )}
              <a href={`mailto:${studio.email}`} className="sr-only" data-testid="button-email">
                {studio.email}
              </a>
            </dd>
          </div>
          )}
        </dl>

        <a
          ref={mapRef}
          href={studio.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-map"
          data-reveal="unveil"
          style={stagger(3)}
          aria-label={t("სტუდია რუკაზე", "The studio on the map")}
        >
          {showMap && (
            <iframe
              src={studio.mapEmbedUrl}
              title={t("THE MR Studio რუკაზე", "THE MR Studio on the map")}
              loading="lazy"
              referrerPolicy="no-referrer"
              tabIndex={-1}
            />
          )}
        </a>
      </div>

      <div className="shell footer-base">
        <span>© 2026 THE MR Studio</span>
        {/* The maker's credit lives in the developer console (lib/signature.ts) */}
      </div>

      <div className="footer-wordmark" data-reveal="wordmark" aria-hidden>
        <Wordmark />
      </div>
    </footer>
  );
}
