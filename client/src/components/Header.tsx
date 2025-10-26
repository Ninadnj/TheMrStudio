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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass border-b' : 'bg-background/80 dark:bg-background/90 backdrop-blur-md shadow-sm border-b border-border/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md"
            data-testid="button-logo"
          >
            <img 
              src={logoImage} 
              alt="MR Studio" 
              className="h-10 w-10 object-contain"
            />
            <span className="font-serif text-xl md:text-2xl transition-colors text-foreground">
              <span style={{ opacity: 0.3 }}>THE </span>
              <span>MR</span>
              <span style={{ opacity: 0.3 }}> Studio</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('services')}
              className="text-sm font-medium transition-colors hover:text-theme-accent text-foreground"
              data-testid="nav-services"
            >
              სერვისები
            </button>
            <button
              onClick={() => scrollToSection('prices')}
              className="text-sm font-medium transition-colors hover:text-theme-accent text-foreground"
              data-testid="nav-prices"
            >
              ფასები
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-sm font-medium transition-colors hover:text-theme-accent text-foreground"
              data-testid="nav-gallery"
            >
              გალერეა
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-sm font-medium transition-colors hover:text-theme-accent text-foreground"
              data-testid="nav-booking"
            >
              დაჯავშნა
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium transition-colors hover:text-theme-accent text-foreground"
              data-testid="nav-contact"
            >
              კონტაქტი
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitch />

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-t border-border">
          <nav className="flex flex-col p-6 gap-4">
            <button
              onClick={() => scrollToSection('services')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              სერვისები
            </button>
            <button
              onClick={() => scrollToSection('prices')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              ფასები
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              გალერეა
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              დაჯავშნა
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              კონტაქტი
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
