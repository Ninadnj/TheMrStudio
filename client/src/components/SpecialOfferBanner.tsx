import { useQuery } from "@tanstack/react-query";
import type { SpecialOffer } from "@shared/schema";
import { X, Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SpecialOfferBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: activeOffer } = useQuery<SpecialOffer | null>({
    queryKey: ["/api/special-offers/active"],
  });

  if (!activeOffer || dismissed) {
    return null;
  }

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
    ? "cursor-pointer hover-elevate active-elevate-2"
    : "";

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto max-w-2xl bg-theme/80 backdrop-blur-xl border border-border text-theme-text py-3 px-6 rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-[100] transition-all duration-500 hover:bg-theme hover:border-theme-accent/50 ${bannerClasses}`}
      onClick={activeOffer.link ? handleClick : undefined}
      data-testid="special-offer-banner"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex bg-theme-accent/20 p-2 rounded-none hidden sm:flex">
          <Megaphone className="w-4 h-4 text-theme-accent" />
        </div>
        <p className="text-sm md:text-base font-medium text-center flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {activeOffer.message}
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
