import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Experience } from "@/content/loader";
import { Period } from "./Period";
import { Tag } from "./Tag";
import { MediaGallery } from "./MediaGallery";
import { Attachments } from "./Attachments";
import { useLang } from "./LangProvider";

type Props = {
  item: Experience;
};

export function ExperienceItem({ item }: Props) {
  const { t } = useLang();
  const hasAbout = Boolean(item.aboutShort) || (item.aboutTags?.length ?? 0) > 0;
  const hasHighlights = (item.highlights?.length ?? 0) > 0;

  return (
    <article className="prose-cv">
      <header className="flex flex-col gap-1 border-b border-ink-200 pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
        <div>
          <h3 className="h-company m-0">{item.company}</h3>
          <p className="h-role">{item.role}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          {item.location ? <span className="font-medium">{item.location}</span> : null}
          {item.location ? <span aria-hidden>·</span> : null}
          <Period period={item.period} />
        </div>
      </header>

      {hasAbout ? (
        <div className="mt-4">
          {item.aboutTags && item.aboutTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.aboutTags.map((tg) => (
                <Tag key={tg} label={tg} />
              ))}
            </div>
          ) : null}
          {item.aboutShort ? (
            <details className="summary-chevron mt-3 group rounded-lg border border-ink-200 bg-paper-deep/40 px-3 py-2 open:bg-paper-deep/60">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.18em] text-accent-deep">
                {t("ui.aboutShort")}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-800">
                {item.aboutShort}
              </p>
            </details>
          ) : null}
        </div>
      ) : null}

      {item.body ? (
        <div className="mt-4">
          <h3 className="h-section mb-2">{t("ui.whatIDid")}</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>
        </div>
      ) : null}

      {hasHighlights ? (
        <div className="mt-5">
          <div className="h-section mb-2">{t("ui.highlights")}</div>
          <div className="flex flex-wrap gap-1.5">
            {item.highlights!.map((hl) => (
              <Tag key={hl} label={hl} size="sm" />
            ))}
          </div>
        </div>
      ) : null}

      {item.attachments && item.attachments.length > 0 ? (
        <div className="mt-6">
          <div className="h-section mb-3">{t("ui.recommendations")}</div>
          <Attachments items={item.attachments} />
        </div>
      ) : null}

      {item.media && item.media.length > 0 ? (
        <div className="no-print mt-6">
          <div className="h-section mb-3">{t("ui.media")}</div>
          <MediaGallery items={item.media} />
        </div>
      ) : null}
    </article>
  );
}
