import { useEffect, useState } from "react";
import { Home, Sparkles, Image as ImageIcon, Phone, CalendarCheck, type LucideIcon } from "lucide-react";
import { hapticTap } from "@/lib/haptics";

type SectionId = "home" | "services" | "gallery" | "contact";

const tabs: { id: SectionId; labelKa: string; icon: LucideIcon }[] = [
  { id: "home", labelKa: "მთავარი", icon: Home },
  { id: "services", labelKa: "სერვისები", icon: Sparkles },
  { id: "gallery", labelKa: "გალერეა", icon: ImageIcon },
  { id: "contact", labelKa: "კონტაქტი", icon: Phone },
];

function scrollToId(id: SectionId) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MobileBottomNav() {
  const [active, setActive] = useState<SectionId>("home");

  useEffect(() => {
    const ids: SectionId[] = ["home", "services", "gallery", "contact"];
    const handleScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let current: SectionId = "home";
      for (const id of ids) {
        if (id === "home") continue;
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      }
      if (window.scrollY < 200) current = "home";
      setActive(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      <div className="relative w-full safe-bottom pb-3 px-4 float-in">
        {/* Floating "Book now" FAB — orbits above the tab bar */}
        <button
          onClick={() => {
            hapticTap();
            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          aria-label="Book now"
          className="press-tap accent-glow pointer-events-auto absolute right-6 -top-2 flex items-center gap-2 px-5 h-14 rounded-full bg-[var(--theme-accent)] text-[var(--theme-on-accent)] font-medium tracking-tight"
          data-testid="bottomnav-book-fab"
        >
          <CalendarCheck className="w-5 h-5" strokeWidth={2.2} />
          <span className="text-sm">დაჯავშნა</span>
        </button>

        {/* Floating tab bar capsule */}
        <nav
          className="ios-glass pointer-events-auto mx-auto flex items-center justify-around gap-1 px-2 py-2 rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] max-w-[320px]"
          aria-label="Primary"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  hapticTap();
                  scrollToId(tab.id);
                }}
                aria-label={tab.labelKa}
                aria-current={isActive ? "page" : undefined}
                className={`press-tap relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-full transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--theme-text)]"
                    : "text-[var(--theme-muted1)]"
                }`}
                data-testid={`bottomnav-${tab.id}`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[var(--theme-soft)]/40"
                  />
                )}
                <Icon
                  className={`relative w-[22px] h-[22px]`}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className="relative text-[10px] mt-0.5 font-medium tracking-tight leading-none">
                  {tab.labelKa}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
