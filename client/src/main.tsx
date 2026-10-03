import { createRoot } from "react-dom/client";
import App from "./App";
import { LangProvider } from "./lib/i18n";
import "./lib/installPrompt";
import { signConsole } from "./lib/signature";
import { initReveals } from "./lib/reveal";
import "./index.css";

initReveals();

createRoot(document.getElementById("root")!).render(
  <LangProvider>
    <App />
  </LangProvider>
);

signConsole();

// Register service worker only in production. In dev mode the SW interferes
// with Vite HMR and asset fingerprinting.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
