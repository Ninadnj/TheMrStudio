import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { hapticTap } from "@/lib/haptics";

/**
 * "Add to home screen" banner.
 *
 * - Chromium browsers fire `beforeinstallprompt` when installable. We hold the
 *   event and call `.prompt()` on user click (browser requires user gesture).
 * - iOS Safari does not fire that event but supports manual install via
 *   Share, then Add to Home Screen. We surface a small hint there too.
 * - Hides forever (per session) once dismissed.
 * - Hides when the page is already running in standalone (installed) mode.
 */

const DISMISSED_KEY = "mr_install_dismissed";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari uses navigator.standalone
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS won't fire that event — show the hint after a short delay so it
    // doesn't fight the preloader.
    if (isIOS()) {
      const t = setTimeout(() => setShowIosHint(true), 6000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;
  if (!deferred && !showIosHint) return null;

  const handleInstall = async () => {
    hapticTap();
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "dismissed") {
      sessionStorage.setItem(DISMISSED_KEY, "1");
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    hapticTap();
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  // iOS variant — manual instructions, no Install button
  if (showIosHint && !deferred) {
    return (
      <div
        className="fixed left-4 right-4 z-[55] mx-auto max-w-md float-in"
        style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="ios-glass rounded-[8px] p-3.5 flex items-center gap-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--theme-accent)]/15 flex items-center justify-center">
            <Download className="w-4 h-4 text-[var(--theme-accent)]" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight">
              დაამატე მთავარ ეკრანზე
            </p>
            <p className="text-[11px] text-foreground/60 mt-0.5 inline-flex items-center gap-1.5">
              <Share2 className="w-3 h-3" strokeWidth={1.7} aria-hidden="true" />
              <span>Share, then Add to Home Screen</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="press-tap shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5"
          >
            <X className="w-4 h-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    );
  }

  // Chromium variant — direct Install button
  return (
    <div
      className="fixed left-4 right-4 z-[55] mx-auto max-w-md float-in"
      style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="ios-glass rounded-[8px] p-3.5 flex items-center gap-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--theme-accent)]/15 flex items-center justify-center">
          <Download className="w-4 h-4 text-[var(--theme-accent)]" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground leading-tight">
            დააინსტალირე აპი
          </p>
          <p className="text-[11px] text-foreground/60 mt-0.5">
            სწრაფი წვდომა მთავარი ეკრანიდან
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="press-tap accent-glow shrink-0 h-9 px-3.5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-on-accent)] text-xs font-medium tracking-normal"
          data-testid="install-prompt-install"
        >
          ინსტალაცია
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="press-tap shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5"
        >
          <X className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
