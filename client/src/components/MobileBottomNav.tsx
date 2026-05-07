import { useEffect, useState } from "react";
import { Home, List, Image as ImageIcon, Phone, CalendarCheck, type LucideIcon } from "lucide-react";
import { hapticTap } from "@/lib/haptics";

type SectionId = "home" | "services" | "gallery" | "booking" | "contact";

const tabs: { id: SectionId; labelKa: string; icon: LucideIcon }[] = [
  { id: "home", labelKa: "მთავარი", icon: Home },
  { id: "services", labelKa: "სერვისები", icon: List },
  { id: "gallery", labelKa: "გალერეა", icon: ImageIcon },
  { id: "booking", labelKa: "დაჯავშნა", icon: CalendarCheck },
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
    const ids: SectionId[] = ["home", "services", "gallery", "booking", "contact"];
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
        <nav
          className="ios-glass pointer-events-auto mx-auto flex items-center justify-around gap-1 px-2 py-2 rounded-full shadow-[0_18px_54px_-32px_rgba(0,0,0,0.55)] max-w-[380px]"
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
                    ? "text-[var(--theme-accent)]"
                    : "text-[var(--theme-muted1)]"
                }`}
                data-testid={`bottomnav-${tab.id}`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[var(--theme-soft)]/36"
                  />
                )}
                <Icon
                  className={`relative w-[22px] h-[22px]`}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className="relative text-[10px] mt-0.5 font-medium tracking-normal leading-none">
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
