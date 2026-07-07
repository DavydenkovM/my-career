"use client";

import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";

export function TechSection() {
  const { lang, t } = useLang();
  const { techs } = getSiteContent(lang);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {techs.map((block) => (
        <div key={block.category} className="surface p-5 sm:p-6">
          <div className="text-base font-bold text-ink-900">{block.category}</div>
          <div className="mt-4 space-y-4">
            {block.groups.map((group, i) => (
              <div key={i}>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  {t(group.titleKey)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="chip-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
