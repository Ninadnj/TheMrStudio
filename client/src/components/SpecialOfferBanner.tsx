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
      className={`fixed bottom-[7.25rem] md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto max-w-2xl ios-glass text-theme-text py-3 px-4 md:px-5 rounded-full shadow-[0_18px_54px_-34px_rgba(0,0,0,0.65)] z-[100] transition-all duration-500 ${bannerClasses}`}
      onClick={activeOffer.link ? handleClick : undefined}
      data-testid="special-offer-banner"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="hidden sm:flex bg-[var(--theme-accent)]/15 p-2 rounded-full">
          <Megaphone className="w-4 h-4 text-theme-accent" />
        </div>
        <p className="text-sm md:text-base font-medium text-center flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {message}
        </p>
        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-6 w-6 text-theme-muted hover:text-theme-text hover:bg-theme-muted/10 no-default-hover-elevate"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          data-testid="button-dismiss-banner"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
