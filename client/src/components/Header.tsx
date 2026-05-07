import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ThemeSwitch";
import logoImage from "@assets/549364704_122179318094547349_828276851018343606_n_1759441251850.jpg";

const navItems = [
  { id: "services", label: "სერვისები" },
  { id: "prices", label: "ფასები" },
  { id: "gallery", label: "გალერეა" },
  { id: "booking", label: "დაჯავშნა" },
  { id: "contact", label: "კონტაქტი" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? 'ios-glass py-2 md:py-3 shadow-[0_18px_60px_-48px_rgba(0,0,0,0.45)]' : 'bg-transparent py-5 md:py-7'
        }`}
    >
      <div className="editorial-max-width">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group"
            data-testid="button-logo"
          >
            <div className={`relative overflow-hidden w-11 h-11 rounded-xl border transition-colors duration-500 ${isScrolled ? 'border-border/70' : 'border-[var(--theme-cream)]/25'}`}>
              <img
                src={logoImage}
                alt="MR Studio"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <span className={`font-display text-xl md:text-2xl tracking-normal transition-colors duration-500 ${isScrolled ? 'text-theme-text' : 'text-[var(--theme-cream)]'}`}>
              <span className="opacity-50">THE </span>
              <span>MR</span>
              <span className="opacity-50"> Studio</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-2 rounded-full p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-xs uppercase font-medium transition-all duration-300 relative group px-3.5 py-2 rounded-full ${isScrolled ? 'text-theme-text/70 hover:text-theme-text hover:bg-secondary/70' : 'text-[var(--theme-cream)]/78 hover:text-[var(--theme-cream)] hover:bg-[var(--theme-cream)]/10'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitch />

            <Button
              size="icon"
              variant="ghost"
              className={`md:hidden rounded-full ${isScrolled ? 'text-theme-text' : 'text-[var(--theme-cream)] hover:bg-[var(--theme-cream)]/10'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="ios-glass fixed inset-x-3 top-[82px] z-40 rounded-[8px] border p-5 md:hidden shadow-[0_24px_70px_-48px_rgba(0,0,0,0.55)]">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="rounded-xl px-3 py-3 text-left font-display text-2xl tracking-normal text-theme-text hover:text-theme-accent hover:bg-secondary/50 transition-colors"
                style={{ opacity: 0, animation: 'revealUp 0.5s forwards', animationDelay: '0.1s' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
