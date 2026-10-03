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
    <div role="group" aria-label="Language / ენა" className="lang-toggle">
      <button
        type="button"
        onClick={() => set("ka")}
        aria-pressed={lang === "ka"}
        aria-label="ka · ქართული"
        data-testid="lang-ka"
      >
        ka
      </button>
      <span aria-hidden />
      <button
        type="button"
        onClick={() => set("en")}
        aria-pressed={lang === "en"}
        aria-label="en · English"
        data-testid="lang-en"
      >
        en
      </button>
    </div>
  );
}
