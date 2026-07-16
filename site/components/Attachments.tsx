"use client";

import { useLang } from "./LangProvider";
import type { AttachmentItem } from "@/content/loader";

type Props = {
  items: AttachmentItem[];
};

export function Attachments({ items }: Props) {
  const { t } = useLang();

  return (
    <ul className="!m-0 grid !list-none !gap-3 !p-0">
      {items.map((item, i) => (
        <li
          key={item.href + i}
          className="surface group flex flex-col overflow-hidden p-3 transition hover:border-accent sm:flex-row sm:p-4"
        >
          {item.preview ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.title}
              className="no-print relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-md border border-ink-200 bg-paper-deep sm:aspect-auto sm:h-auto sm:w-40 sm:shrink-0 md:w-48"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-white opacity-0 transition group-hover:opacity-100"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14 21 3" />
                  <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                </svg>
              </span>
            </a>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-3 sm:pl-5 sm:pt-0">
            <p className="m-0 text-sm font-semibold leading-snug text-ink-900">
              {item.title}
            </p>
            {item.subtitle ? (
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                {item.subtitle}
              </p>
            ) : null}
            {item.description ? (
              <p className="m-0 text-xs leading-relaxed text-ink-700">
                {item.description}
              </p>
            ) : null}
            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary no-print"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14 21 3" />
                  <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                </svg>
                {t("ui.openDocument")}
              </a>
              <span className="text-[11px] font-mono tabular-nums text-ink-500">
                {t("ui.documentSize")}
                {item.size ? ` ${item.size}` : ""}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}