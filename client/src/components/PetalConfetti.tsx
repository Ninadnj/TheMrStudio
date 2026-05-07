import { useMemo } from "react";

/**
 * Soft petal-shower for celebratory moments (booking success, etc).
 * Pure CSS animation, no JS frame loop. Petals are tiny SVG ovals colored
 * from the brand palette, layered with random horizontal drift, fall duration,
 * rotation, and start delay so the shower never repeats the same way.
 */

type Props = {
  /** Number of petals to render. */
  count?: number;
  /** Total animation lifespan in ms. After this elapses the component can unmount. */
  durationMs?: number;
};

const PETAL_COLORS = [
  "#FFFDF8", // cream
  "#D7D9CD", // sand
  "#A6BBA3", // light sage
  "#8EA58C", // soft coastal green
  "#E5C7C9", // dusty rose tint
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function PetalConfetti({ count = 32, durationMs = 4000 }: Props) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = rand(-5, 105); // % across viewport, slight overflow
        const size = rand(8, 16);
        const fallDuration = rand(2.6, 4.2);
        const delay = rand(0, 0.9);
        const drift = rand(-60, 60); // px horizontal sway
        const startRotate = rand(0, 360);
        const endRotate = startRotate + rand(180, 540) * (Math.random() > 0.5 ? 1 : -1);
        const color = PETAL_COLORS[i % PETAL_COLORS.length];
        const opacity = rand(0.55, 0.95);
        return {
          id: i,
          left,
          size,
          fallDuration,
          delay,
          drift,
          startRotate,
          endRotate,
          color,
          opacity,
        };
      }),
    [count]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      style={{ animation: `petal-fade-out 0.5s ease-out ${durationMs - 500}ms forwards` }}
    >
      <style>{`
        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -20vh, 0) rotate(var(--start-rot));
            opacity: 0;
          }
          10% {
            opacity: var(--peak-opacity);
          }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--end-rot));
            opacity: 0;
          }
        }
        @keyframes petal-fade-out {
          to { opacity: 0; }
        }
      `}</style>

      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 will-change-transform"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.65,
            background: p.color,
            borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
            opacity: 0,
            ["--start-rot" as any]: `${p.startRotate}deg`,
            ["--end-rot" as any]: `${p.endRotate}deg`,
            ["--drift" as any]: `${p.drift}px`,
            ["--peak-opacity" as any]: p.opacity,
            animation: `petal-fall ${p.fallDuration}s cubic-bezier(0.4, 0.05, 0.5, 0.95) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
