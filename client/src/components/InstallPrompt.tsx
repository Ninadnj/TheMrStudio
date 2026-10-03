import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useLang } from "@/lib/i18n";
import { clearInstallPrompt, getInstallPrompt } from "@/lib/installPrompt";

/**
 * "Keep the studio on your home screen" — shown only inside the booking
 * confirmation, never on a first visit.
 *
 * - Chromium's `beforeinstallprompt` is held from page load (lib/installPrompt)
 *   and replayed on click.
 * - iOS Safari has no event; it gets a one-line Share → Add to Home Screen hint.
 * - Hidden when already installed or dismissed this session.
 */

const DISMISSED_KEY = "mr_install_dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const { t } = useLang();
  const [mode, setMode] = useState<"install" | "ios" | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;
    if (getInstallPrompt()) setMode("install");
    else if (isIOS()) setMode("ios");
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* noop */
    }
    setMode(null);
  };

  const install = async () => {
    hapticTap();
    const prompt = getInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    clearInstallPrompt();
    if (choice.outcome === "dismissed") dismiss();
    else setMode(null);
  };

  return (
    <div className="install-inline" data-testid="install-prompt">
      <div className="min-w-0">
        <p className="install-inline-title">
          {t("დაამატეთ საიტი მთავარ ეკრანზე", "Keep the studio on your home screen")}
        </p>
        <p className="install-inline-text">
          {mode === "ios" ? (
            <>
              <Share2 className="inline h-3.5 w-3.5 -mt-0.5 mr-1" strokeWidth={1.6} aria-hidden />
              {t("Share → „მთავარ ეკრანზე დამატება“", "Share, then Add to Home Screen")}
            </>
          ) : (
            t("შემდეგ ჯერზე დაჯავშნა უფრო სწრაფი იქნება.", "Your next booking is one tap away.")
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {mode === "install" && (
          <button type="button" onClick={install} className="btn-quiet" data-testid="install-prompt-install">
            {t("დამატება", "Add")}
          </button>
        )}
        <button type="button" onClick={dismiss} className="install-inline-dismiss">
          {t("არა, მადლობა", "No thanks")}
        </button>
      </div>
    </div>
  );
}
