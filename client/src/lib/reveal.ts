import type { CSSProperties } from "react";

/**
 * Scroll reveals. Elements marked `data-reveal="rise" | "mask" | "unveil"` animate in
 * the first time they come into view; the motion itself is CSS (index.css, "Scroll
 * reveals") — this only flips `data-revealed`. Visitors who prefer reduced motion
 * never get the `motion` class, so nothing is ever hidden from them.
 */
export function initReveals() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("motion");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = "";
        io.unobserve(entry.target);
      }
    },
    // Start a little before the element is fully in, so it's moving as it arrives
    { rootMargin: "0px 0px -6% 0px", threshold: 0 }
  );

  const watch = (root: ParentNode) =>
    root.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => io.observe(el));

  watch(document);
  // React renders sections (and the fetched price list) after start-up: pick them up as they appear
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("[data-reveal]:not([data-revealed])")) io.observe(node);
        watch(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}

/** Position in a list, so siblings arrive one after another (capped in CSS). */
export function stagger(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
