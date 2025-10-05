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
      className={`relative bg-theme-accent text-white py-3 px-4 ${bannerClasses}`}
      onClick={activeOffer.link ? handleClick : undefined}
      data-testid="special-offer-banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm md:text-base font-medium text-center flex-1">
          {activeOffer.message}
        </p>
        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-6 w-6 text-white hover:bg-white/20 no-default-hover-elevate"
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
