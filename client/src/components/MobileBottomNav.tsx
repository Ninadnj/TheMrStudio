import { useEffect, useState } from "react";
import { Home, List, Image as ImageIcon, Phone, CalendarCheck, type LucideIcon } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

type SectionId = "home" | "services" | "gallery" | "booking" | "contact";

function scrollToId(id: SectionId) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MobileBottomNav() {
  const { t } = useLang();
  const [active, setActive] = useState<SectionId>("home");

  const tabs: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "home", label: t("მთავარი", "Home"), icon: Home },
    { id: "services", label: t("სერვისები", "Services"), icon: List },
    { id: "gallery", label: t("გალერეა", "Gallery"), icon: ImageIcon },
    { id: "booking", label: t("დაჯავშნა", "Book"), icon: CalendarCheck },
    { id: "contact", label: t("კონტაქტი", "Contact"), icon: Phone },
  ];

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
      <div className="relative w-full safe-bottom pb-2.5 px-3 float-in">
        <nav
          className="pointer-events-auto mx-auto flex items-center justify-around gap-0.5 px-1.5 py-1.5 rounded-full max-w-[400px] bg-[color:color-mix(in_srgb,var(--theme-surface)_88%,transparent)] backdrop-blur-xl border border-[var(--theme-line)]/70 shadow-[var(--ios-shadow-2)]"
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
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={`press-tap relative flex flex-col items-center justify-center flex-1 min-w-[44px] min-h-[48px] px-1 py-1 rounded-full transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--theme-accent)]"
                    : "text-[var(--theme-muted1)]"
                }`}
                data-testid={`bottomnav-${tab.id}`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[color:color-mix(in_srgb,var(--theme-soft)_38%,transparent)]"
                  />
                )}
                <Icon
                  className="relative w-[20px] h-[20px]"
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className="relative text-[9.5px] mt-0.5 font-medium leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
