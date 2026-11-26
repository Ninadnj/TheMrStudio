/** THE · MR · Studio — the one wordmark used everywhere (header, hero, footer, confirmation). */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className ? `wordmark ${className}` : "wordmark"}>
      <span className="sr-only">THE MR Studio</span>
      <span className="wordmark-the" aria-hidden>
        THE
      </span>
      <span className="wordmark-mr" aria-hidden>
        MR
      </span>
      <span className="wordmark-studio" aria-hidden>
        Studio
      </span>
    </span>
  );
}
