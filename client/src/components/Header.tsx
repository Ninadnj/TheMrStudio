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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
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
            <span className="font-serif text-xl md:text-2xl text-foreground">
              <span style={{ opacity: 0.3 }}>THE </span>
              <span className="font-bold">MR</span>
              <span style={{ opacity: 0.3 }}> Studio</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('services')}
              className="text-sm font-medium text-foreground transition-colors"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
              data-testid="nav-services"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-sm font-medium text-foreground transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
              data-testid="nav-booking"
            >
              Book Now
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium text-foreground transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
              data-testid="nav-contact"
            >
              Contact
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
              Services
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              Book Now
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left text-sm font-medium text-foreground transition-colors py-2"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
