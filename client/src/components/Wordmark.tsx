/** THE · MR · Studio — the one wordmark used everywhere (header, hero, footer, confirmation). */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className ? `wordmark ${className}` : "wordmark"} aria-label="THE MR Studio">
      <span className="wordmark-the" aria-hidden>THE</span>
      <span className="wordmark-mr" aria-hidden>MR</span>
      <span className="wordmark-studio" aria-hidden>Studio</span>
    </span>
  );
}
