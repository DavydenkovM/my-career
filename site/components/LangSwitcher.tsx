"use client";

import { languages, useLang } from "./LangProvider";

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center overflow-hidden rounded-md border border-ink-200 bg-white text-sm"
    >
      {languages.map((code, i) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={[
            "px-2.5 py-1 font-medium uppercase tracking-wide transition",
            i > 0 ? "border-l border-ink-200" : "",
            lang === code
              ? "bg-ink-900 text-white"
              : "text-ink-600 hover:bg-ink-50",
          ].join(" ")}
          aria-pressed={lang === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
