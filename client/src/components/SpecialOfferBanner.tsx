import { useQuery } from "@tanstack/react-query";
import type { SpecialOffer } from "@shared/schema";
import { X } from "lucide-react";
import { useState } from "react";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";
import { scrollBehavior } from "@/lib/motion";

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
        element?.scrollIntoView({ behavior: scrollBehavior() });
      } else {
        window.location.href = activeOffer.link;
      }
    }
  };

  // Inline strip at the very top of the page — never a floating pill.
  return (
    <div className="offer-strip" data-testid="special-offer-banner">
      <div className="shell offer-strip-row">
        <span className="offer-glint" aria-hidden />
        {activeOffer.link ? (
          <button type="button" onClick={handleClick} className="offer-strip-text offer-strip-link">
            {message}
          </button>
        ) : (
          <p className="offer-strip-text">{message}</p>
        )}
        <button
          type="button"
          className="offer-strip-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          data-testid="button-dismiss-banner"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
