import { useState, useEffect } from "react";
import ThemeSwitch from "@/components/ThemeSwitch";
import LanguageToggle from "@/components/LanguageToggle";
import Wordmark from "@/components/Wordmark";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking } from "@/lib/serviceMenu";
import { scrollBehavior } from "@/lib/motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLang();

  const navItems = [
    { id: "services", label: t("სერვისები", "Services") },
    { id: "prices", label: t("ფასები", "Prices") },
    { id: "gallery", label: t("გალერეა", "Gallery") },
    { id: "contact", label: t("კონტაქტი", "Contact") },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    hapticTap();
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
  };

  return (
    <header className="site-header" data-scrolled={isScrolled}>
      <div className="shell site-header-row">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            hapticTap();
            window.scrollTo({ top: 0, behavior: scrollBehavior() });
          }}
          className="text-[17px] lg:text-[19px]"
          data-testid="button-logo"
        >
          <Wordmark />
        </a>

        <nav className="site-nav" aria-label={t("მთავარი ნავიგაცია", "Main navigation")}>
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={(e) => scrollToSection(e, item.id)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-tools">
          <LanguageToggle />
          <ThemeSwitch />
          <button
            type="button"
            onClick={() => {
              hapticTap();
              requestBooking();
            }}
            className="btn-quiet header-book"
            data-testid="header-book"
          >
            {t("დაჯავშნა", "Book")}
          </button>
        </div>
      </div>
    </header>
  );
}
