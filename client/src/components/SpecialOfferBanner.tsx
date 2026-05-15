import { useQuery } from "@tanstack/react-query";
import type { SpecialOffer } from "@shared/schema";
import { X, Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

export default function SpecialOfferBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: activeOffer } = useQuery<SpecialOffer | null>({
    queryKey: ["/api/special-offers/active"],
  });

  if (!activeOffer || dismissed) {
    return null;
  }

  const message = stripDecorativeSymbols(activeOffer.message);

  const handleClick = () => {
    if (activeOffer.link) {
      if (activeOffer.link.startsWith('#')) {
        const element = document.querySelector(activeOffer.link);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = activeOffer.link;
      }
    }
  };

  const bannerClasses = activeOffer.link
    ? "cursor-pointer hover:border-[var(--theme-accent)]/50 active-elevate-2"
    : "";

  return (
    <div
      className={`fixed bottom-[6.5rem] md:bottom-5 left-1/2 -translate-x-1/2 w-[92%] sm:w-auto max-w-md text-[var(--theme-text)] py-2.5 px-3.5 md:px-4 rounded-full z-[100] transition-all duration-500 bg-[color:color-mix(in_srgb,var(--theme-surface)_88%,transparent)] backdrop-blur-xl border border-[var(--theme-line)]/70 shadow-[var(--ios-shadow-2)] ${bannerClasses}`}
      onClick={activeOffer.link ? handleClick : undefined}
      data-testid="special-offer-banner"
    >
      <div className="flex items-center gap-2.5 w-full">
        <div className="flex bg-[color:color-mix(in_srgb,var(--theme-accent)_15%,transparent)] p-1.5 rounded-full shrink-0">
          <Megaphone className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
        </div>
        <p className="text-[13px] font-medium flex-1 truncate">
          {message}
        </p>
        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-6 w-6 text-[var(--theme-muted1)] hover:text-[var(--theme-text)] no-default-hover-elevate"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          data-testid="button-dismiss-banner"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
