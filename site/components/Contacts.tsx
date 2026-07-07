"use client";

import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";

export function Contacts() {
  const { lang } = useLang();
  const { contacts } = getSiteContent(lang);
  return (
    <div className="surface p-6 sm:p-8">
      <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {contacts.map((c) => {
          const inner = (
            <span className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                {c.label}
              </span>
              <span className="text-base font-semibold text-ink-900">{c.value}</span>
            </span>
          );
          return (
            <li key={c.label}>
              {c.href ? (
                <a
                  className="link"
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
