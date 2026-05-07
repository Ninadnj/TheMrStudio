import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker only in production. In dev mode the SW interferes
// with Vite HMR and asset fingerprinting.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
