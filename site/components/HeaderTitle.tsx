"use client";

import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";

export function HeaderTitle() {
  const { lang } = useLang();
  const { meta } = getSiteContent(lang);
  return (
    <div className="max-w-3xl">
      <h1 className="h-name">{meta.name}</h1>
      {meta.roles && meta.roles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.roles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center rounded-md border border-ink-200 bg-paper-deep px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink-800"
            >
              {r}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-ink-500">
        {meta.location}
      </p>
    </div>
  );
}
