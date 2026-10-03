import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

/** Gentle wheel smoothing on desktop; native scrolling when reduced motion is preferred. */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }}>
      {children}
    </ReactLenis>
  );
}
