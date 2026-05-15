import { useLang } from "@/lib/i18n";
import { hapticTap } from "@/lib/haptics";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  const set = (next: "ka" | "en") => {
    if (next === lang) return;
    hapticTap();
    setLang(next);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-[var(--theme-line)]/70 bg-[color:color-mix(in_srgb,var(--theme-surface)_88%,transparent)] backdrop-blur-md p-0.5 text-[11px] font-medium tracking-[0.04em] uppercase"
    >
      <button
        type="button"
        onClick={() => set("ka")}
        aria-pressed={lang === "ka"}
        className={`press-tap min-w-[28px] h-7 px-2 rounded-full transition-colors ${
          lang === "ka"
            ? "bg-[var(--theme-accent)] text-[var(--theme-on-accent)]"
            : "text-[var(--theme-muted1)] hover:text-[var(--theme-text)]"
        }`}
        data-testid="lang-ka"
      >
        ka
      </button>
      <button
        type="button"
        onClick={() => set("en")}
        aria-pressed={lang === "en"}
        className={`press-tap min-w-[28px] h-7 px-2 rounded-full transition-colors ${
          lang === "en"
            ? "bg-[var(--theme-accent)] text-[var(--theme-on-accent)]"
            : "text-[var(--theme-muted1)] hover:text-[var(--theme-text)]"
        }`}
        data-testid="lang-en"
      >
        en
      </button>
    </div>
  );
}
