"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translate, type CopyKey, type Language } from "@/lib/i18n";

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: CopyKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("mk");

  useEffect(() => {
    const saved = window.localStorage.getItem("skopje-circular-language");
    if (saved === "mk" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("skopje-circular-language", language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: (key: CopyKey) => translate(key, language) }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
