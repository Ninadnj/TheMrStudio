/**
 * Chromium fires `beforeinstallprompt` once, early, and shows its own install
 * banner unless the event is held. It is captured from the first moment
 * (imported by main.tsx) so the only install offer is the one inside the
 * booking confirmation (InstallPrompt), never a first visit.
 */

export type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: BIPEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BIPEvent;
  });
}

export function getInstallPrompt() {
  return deferred;
}

export function clearInstallPrompt() {
  deferred = null;
}
