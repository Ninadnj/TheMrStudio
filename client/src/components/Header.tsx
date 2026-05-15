import { useState, useEffect } from "react";
import ThemeSwitch from "@/components/ThemeSwitch";
import LanguageToggle from "@/components/LanguageToggle";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLang();

  const navItems = [
    { id: "services", label: t("სერვისები", "Services") },
    { id: "prices", label: t("ფასები", "Prices") },
    { id: "gallery", label: t("გალერეა", "Gallery") },
    { id: "booking", label: t("დაჯავშნა", "Book") },
    { id: "contact", label: t("კონტაქტი", "Contact") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    hapticTap();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-[color:color-mix(in_srgb,var(--theme-bg)_82%,transparent)] backdrop-blur-xl border-b border-[var(--theme-line)]/60"
          : "bg-transparent"
      }`}
    >
      <div className="app-shell md:!max-w-3xl">
        <div className="flex items-center justify-between h-14 md:h-16">
          <button
            onClick={() => {
              hapticTap();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="press-tap flex items-center group"
            data-testid="button-logo"
          >
            <span className="font-sans text-[15px] tracking-[-0.01em] font-semibold text-[var(--theme-text)]">
              <span className="opacity-50 font-normal">THE </span>
              MR
              <span className="font-serif italic font-normal text-[var(--theme-accent)] ml-0.5">Studio</span>
            </span>
          </button>

          {/* Desktop pill nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="press-tap text-[12.5px] font-medium px-3 py-1.5 rounded-full text-[var(--theme-muted1)] hover:text-[var(--theme-text)] hover:bg-[color:color-mix(in_srgb,var(--theme-soft)_28%,transparent)] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
}
