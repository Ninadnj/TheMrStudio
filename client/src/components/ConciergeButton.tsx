import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";

const WHATSAPP_NUMBER = "995551287555";

export default function ConciergeButton() {
  const { t } = useLang();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!hasMounted) return null;

  const presetMessage = t(
    "გამარჯობა! დაჯავშნაზე მინდა ინფორმაცია.",
    "Hi — I'd like some information about booking."
  );
  const label = t("დაგვიკავშირდი", "Concierge");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(presetMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => hapticTap()}
      aria-label={`${label} — WhatsApp`}
      data-testid="concierge-button"
      className="press-tap fixed z-[60] bottom-[10.5rem] right-4 md:bottom-6 md:right-6 inline-flex items-center justify-center md:justify-start gap-2 rounded-full h-12 w-12 md:w-auto md:pl-3.5 md:pr-4 bg-[var(--theme-accent)] text-[var(--theme-on-accent)] shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--theme-accent)_70%,transparent),0_4px_10px_-4px_rgba(15,22,16,0.18)] border border-[color:color-mix(in_srgb,#000_8%,transparent)] hover:bg-[var(--theme-accent-hover)] transition-colors float-in"
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full md:bg-white/12">
        <MessageCircle className="w-[18px] h-[18px] md:w-4 md:h-4" strokeWidth={2} />
        <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#7CC36A] ring-2 ring-[var(--theme-accent)]" />
      </span>
      <span className="hidden md:inline text-[13px] font-semibold tracking-[-0.005em]">{label}</span>
    </a>
  );
}
