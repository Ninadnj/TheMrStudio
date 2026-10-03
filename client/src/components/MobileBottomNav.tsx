import { useEffect, useState } from "react";
import { Home, List, Image as ImageIcon, Phone, CalendarCheck, type LucideIcon } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { requestBooking } from "@/lib/serviceMenu";
import { scrollBehavior } from "@/lib/motion";

type SectionId = "home" | "services" | "gallery" | "booking" | "contact";

function scrollToId(id: SectionId) {
  if (id === "booking") {
    requestBooking();
    return;
  }
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

export default function MobileBottomNav() {
  const { t } = useLang();
  const [active, setActive] = useState<SectionId>("home");

  const tabs: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "home", label: t("მთავარი", "Home"), icon: Home },
    { id: "services", label: t("სერვისები", "Services"), icon: List },
    { id: "booking", label: t("დაჯავშნა", "Book"), icon: CalendarCheck },
    { id: "gallery", label: t("გალერეა", "Gallery"), icon: ImageIcon },
    { id: "contact", label: t("კონტაქტი", "Contact"), icon: Phone },
  ];

  useEffect(() => {
    const ids: SectionId[] = ["services", "gallery", "booking", "contact"];
    const handleScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let current: SectionId = "home";
      for (const id of ids) {
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
      <div className="safe-bottom px-3 pb-2.5">
        <nav className="tabbar pointer-events-auto" aria-label={t("ნავიგაცია", "Navigation")}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            const isBook = tab.id === "booking";
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  scrollToId(tab.id);
                }}
                aria-current={isActive && !isBook ? "page" : undefined}
                className="tabbar-item press-tap"
                data-active={isActive}
                data-book={isBook}
                data-testid={`bottomnav-${tab.id}`}
              >
                <span className="tabbar-icon">
                  <Icon className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </span>
                <span className="tabbar-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
