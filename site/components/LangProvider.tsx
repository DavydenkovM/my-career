"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultLanguage, languages, type Language, t as translate, tArr as translateArr } from "@/content/i18n";

type LangContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
  t: (key: string) => string;
  tArr: (key: string) => string[];
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "cv:lang";

function isLanguage(value: string | null): value is Language {
  return value === "ru" || value === "en";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "ru" ? "en" : "ru");
  }, [lang, setLang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      toggle,
      t: (key: string) => translate(lang, key),
      tArr: (key: string) => translateArr(lang, key),
    }),
    [lang, setLang, toggle]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LangProvider>");
  return ctx;
}

export { languages };
