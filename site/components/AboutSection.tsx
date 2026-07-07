"use client";

import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";

function renderInline(text: string): string {
  return text.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-ink-900">$1</strong>',
  );
}

export function AboutSection() {
  const { lang, t } = useLang();
  const { about, competencies, offerings, achievements } = getSiteContent(lang);
  return (
    <div className="surface space-y-7 p-6 sm:p-8">
      <div className="prose-cv space-y-3">
        {about.map((p, i) => (
          <p
            key={i}
            className="text-[1.05rem] leading-relaxed text-ink-800"
            dangerouslySetInnerHTML={{ __html: renderInline(p) }}
          />
        ))}
      </div>

      <div>
        <div className="h-section mb-3">{t("ui.offerings")}</div>
        <ul className="prose-cv list-disc space-y-1.5 pl-5">
          {offerings.map((o, i) => (
            <li
              key={i}
              className="text-[1.02rem]"
              dangerouslySetInnerHTML={{ __html: renderInline(o) }}
            />
          ))}
        </ul>
      </div>

      <div>
        <div className="h-section mb-3">{t("ui.achievements")}</div>
        <ul className="prose-cv list-disc space-y-1.5 pl-5">
          {achievements.map((a, i) => (
            <li
              key={i}
              className="text-[1.02rem]"
              dangerouslySetInnerHTML={{ __html: renderInline(a.text) }}
            />
          ))}
        </ul>
      </div>

      <div>
        <div className="h-section mb-3">{t("ui.specialization")}</div>
        <div className="flex flex-wrap gap-1.5">
          {competencies.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
