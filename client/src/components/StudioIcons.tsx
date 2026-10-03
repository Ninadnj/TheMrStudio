import type { SVGProps } from "react";

/**
 * Fine-line icon set for THE MR Studio's services.
 * One drawing language: 24px grid, hairline strokes, round joins, and a single
 * champagne-gold accent (`--icon-accent`) per icon.
 */

export type StudioIconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string };

function Frame({ children, strokeWidth = 1.25, ...props }: StudioIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

const accent = { stroke: "var(--icon-accent, currentColor)" };
const accentFill = { fill: "var(--icon-accent, currentColor)", stroke: "none" };

/** Nails — a lacquer bottle: tall cap, collar, gold polish inside and a highlight. */
export function PolishIcon(props: StudioIconProps) {
  return (
    <Frame {...props}>
      <path d="M10.6 10V2.7c0-.6.4-1 1-1h.8c.6 0 1 .4 1 1V10" />
      <path d="M9.4 10h5.2v1.6H9.4Z" />
      <path d="M7.4 11.6h9.2c.9 0 1.6.7 1.6 1.6v6.4a2.6 2.6 0 0 1-2.6 2.6H8.4a2.6 2.6 0 0 1-2.6-2.6v-6.4c0-.9.7-1.6 1.6-1.6Z" />
      <path
        d="M6.9 16c1.7-.9 3.4-.9 5.1 0s3.4.9 5.1 0v3.5c0 .9-.7 1.6-1.6 1.6H8.5c-.9 0-1.6-.7-1.6-1.6Z"
        style={{ ...accentFill, opacity: 0.9 }}
      />
      <path d="M8.4 17.4v1.9" style={{ stroke: "#FDFBF8", opacity: 0.9 }} />
    </Frame>
  );
}

/** Pedicure — a lotus over still water: spa care. */
export function LotusIcon(props: StudioIconProps) {
  return (
    <Frame {...props}>
      <path d="M12 5.2c-2 2.3-2.7 4.8-2.1 7.3.4 1.4 1.1 2.4 2.1 3 1-.6 1.7-1.6 2.1-3 .6-2.5-.1-5-2.1-7.3Z" />
      <path d="M12 15.5c-3-.1-5.9-1.9-7.1-5.8 2.6-.1 4.6.9 5.9 2.6" />
      <path d="M12 15.5c3-.1 5.9-1.9 7.1-5.8-2.6-.1-4.6.9-5.9 2.6" />
      <path d="M5 19.2c2.3.9 4.7.9 7 0s4.7-.9 7 0" style={accent} />
    </Frame>
  );
}

/** Laser — a focused beam meeting the skin in a gold spark. */
export function BeamIcon(props: StudioIconProps) {
  return (
    <Frame {...props}>
      <path d="M12 2.5v6" />
      <path d="M7.4 7.6l1.4 1.3M16.6 7.6l-1.4 1.3" opacity={0.6} />
      <path
        d="M12 9.6c.4 2 1.4 3 3.4 3.4-2 .4-3 1.4-3.4 3.4-.4-2-1.4-3-3.4-3.4 2-.4 3-1.4 3.4-3.4Z"
        style={accentFill}
      />
      <path d="M3.5 20.3c2.8-1.7 5.7-1.7 8.5 0s5.7 1.7 8.5 0" />
    </Frame>
  );
}

/** Aesthetics — a serum drop with a gold highlight. */
export function DropIcon(props: StudioIconProps) {
  return (
    <Frame {...props}>
      <path d="M12 3c-3 3.9-5.6 7.1-5.6 10.4a5.6 5.6 0 0 0 11.2 0C17.6 10.1 15 6.9 12 3Z" />
      <path d="M9.4 14.2a2.7 2.7 0 0 0 2.4 2.7" style={accent} />
      <path d="M18.6 4.2c.2 1 .6 1.4 1.6 1.6-1 .2-1.4.6-1.6 1.6-.2-1-.6-1.4-1.6-1.6 1-.2 1.4-.6 1.6-1.6Z" style={accentFill} />
    </Frame>
  );
}
