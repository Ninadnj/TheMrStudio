import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ThemeSwitch";
import logoImage from "@assets/549364704_122179318094547349_828276851018343606_n_1759441251850.jpg";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-background border-b border-border py-4' : 'bg-transparent py-8'
        }`}
    >
      <div className="editorial-max-width">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
            data-testid="button-logo"
          >
            <div className="relative overflow-hidden w-12 h-12 rounded-none border border-white/20">
              <img
                src={logoImage}
                alt="MR Studio"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <span className={`font-display text-2xl md:text-3xl transition-colors duration-500 ${isScrolled ? 'text-theme-text' : 'text-white'}`}>
              <span className="opacity-40">THE </span>
              <span>MR</span>
              <span className="opacity-40"> Studio</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {['Services', 'Prices', 'Gallery', 'Booking', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm tracking-widest uppercase font-medium transition-all duration-300 relative group py-2 ${isScrolled ? 'text-theme-text/80 hover:text-theme-text' : 'text-white/80 hover:text-white'
                  }`}
              >
                {item === 'Services' && 'სერვისები'}
                {item === 'Prices' && 'ფასები'}
                {item === 'Gallery' && 'გალერეა'}
                {item === 'Booking' && 'დაჯავშნა'}
                {item === 'Contact' && 'კონტაქტი'}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${isScrolled ? 'bg-theme-accent' : 'bg-white'
                  }`}></span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitch />

            <Button
              size="icon"
              variant="ghost"
              className={`md:hidden ${isScrolled ? 'text-theme-text' : 'text-white hover:bg-white/10'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="bg-background fixed inset-0 top-[80px] z-40 border-t border-border p-6 md:hidden">
          <nav className="flex flex-col gap-6">
            {['Services', 'Prices', 'Gallery', 'Booking', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left font-display text-3xl text-theme-text hover:text-theme-accent transition-colors"
                style={{ opacity: 0, animation: 'revealUp 0.5s forwards', animationDelay: '0.1s' }}
              >
                {item === 'Services' && 'სერვისები'}
                {item === 'Prices' && 'ფასები'}
                {item === 'Gallery' && 'გალერეა'}
                {item === 'Booking' && 'დაჯავშნა'}
                {item === 'Contact' && 'კონტაქტი'}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
