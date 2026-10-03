import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { bookingCategories, requestBooking, type BookingRequest } from "@/lib/serviceMenu";
import { useStudio } from "@/lib/studio";
import { stagger } from "@/lib/reveal";

/** The booking invitation on the page. The sheet itself loads on demand (BookingLauncher). */
export default function BookingSection() {
  const { t, lang } = useLang();
  const studio = useStudio();

  const steps: { title: string; text?: string }[] = [
    { title: t("სერვისი", "Service"), text: t("აირჩიეთ პროცედურა მენიუდან", "Pick a treatment from the menu") },
    { title: t("დრო", "Time") },
    { title: t("დადასტურება", "Confirm"), text: t("დადასტურებას ელ. ფოსტით მიიღებთ", "We confirm your visit by email") },
  ];

  const open = (request?: BookingRequest) => {
    hapticTap();
    requestBooking(request);
  };

  return (
    <section id="booking" className="section booking-stage scroll-mt-20 md:scroll-mt-24" aria-labelledby="booking-title">
      <div className="shell booking-intro">
        <div className="booking-intro-head">
          <p className="eyebrow" data-reveal="rise">{t("ჯავშანი", "Booking")}</p>
          <h2 id="booking-title" className="display booking-intro-title" data-reveal="mask">
            <span>{t("ვიზიტის დაჯავშნა", "Book your visit")}</span>
          </h2>
          <div className="booking-intro-actions" data-reveal="rise" style={stagger(1)}>
            <button type="button" onClick={() => open()} className="pill-primary" data-testid="booking-open">
              {t("დაჯავშნა", "Book now")}
            </button>
            <a
              href={studio.whatsappLink(t("გამარჯობა! მინდა დაჯავშნა.", "Hi, I'd like to book a visit."))}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line"
            >
              {t("ან მოგვწერეთ WhatsApp-ზე", "or message us on WhatsApp")}
            </a>
          </div>
        </div>

        <div className="booking-intro-side">
          <ol className="booking-intro-steps">
            {steps.map(({ title, text }, index) => (
              <li key={title} data-reveal="rise" style={stagger(index)}>
                <span className="booking-intro-num" aria-hidden>
                  0{index + 1}
                </span>
                <span className="min-w-0">
                  <strong>{title}</strong>
                  {text && <span>{text}</span>}
                </span>
              </li>
            ))}
          </ol>

          <div className="booking-intro-shortcuts" data-reveal="rise" style={stagger(3)}>
            <p className="eyebrow">{t("აირჩიეთ სერვისი", "Start with")}</p>
            <div className="flex flex-wrap gap-2">
              {bookingCategories.map(({ value, labelKa, labelEn }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => open({ category: value })}
                  className="btn-quiet"
                  data-testid={`booking-shortcut-${value}`}
                >
                  {lang === "ka" ? labelKa : labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
