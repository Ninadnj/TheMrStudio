import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ka" | "en";

const STORAGE_KEY = "mr_lang";

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<Ctx | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "ka";
  const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved === "ka" || saved === "en") return saved;
  // Default to Georgian since the studio is Tbilisi-based.
  return "ka";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/**
 * Convenience hook. `t(ka, en)` returns the string for the current language.
 *
 *   const { lang, t } = useLang();
 *   <h1>{t("ჩვენი სერვისები", "Our services")}</h1>
 */
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used inside <LangProvider>");
  }
  const t = useCallback(
    (ka: string, en: string) => (ctx.lang === "ka" ? ka : en),
    [ctx.lang]
  );
  return { lang: ctx.lang, setLang: ctx.setLang, t };
}
