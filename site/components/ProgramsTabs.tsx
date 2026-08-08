"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./LangProvider";
import { getSiteContent, type ProgramCategory, type ProgramGroup } from "@/content/site";
import { formatDate } from "@/content/articles/types";

type Props = {
  groups: ProgramGroup[];
};

function readInitialCategory(allowed: ProgramCategory[]): ProgramCategory {
  if (typeof window === "undefined") return allowed[0];
  const raw = window.location.hash.replace(/^#/, "");
  if ((allowed as string[]).includes(raw)) return raw as ProgramCategory;
  return allowed[0];
}

export function ProgramsTabs({ groups }: Props) {
  const { lang, t } = useLang();
  const categories = groups.map((g) => g.category);
  const [active, setActive] = useState<ProgramCategory>(categories[0]);

  useEffect(() => {
    setActive(readInitialCategory(categories));
  }, [categories.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => setActive(readInitialCategory(categories));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [categories]);

  function select(cat: ProgramCategory) {
    setActive(cat);
    if (typeof window !== "undefined") {
      const newHash = `#${cat}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, "", newHash);
      }
    }
  }

  const current = groups.find((g) => g.category === active) ?? groups[0];

  return (
    <div>
      {/* Tabs: hidden on print */}
      <div
        role="tablist"
        aria-label="Programs"
        className="no-print mb-6 flex flex-wrap gap-2"
      >
        {groups.map((g) => {
          const isActive = g.category === active;
          const count = g.items.length;
          return (
            <button
              key={g.category}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-prog-${g.category}`}
              id={`tab-prog-${g.category}`}
              onClick={() => select(g.category)}
              className={[
                "group inline-flex items-baseline gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition active:scale-[0.98]",
                isActive
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-ink-200 bg-white text-ink-800 hover:border-accent hover:text-accent",
              ].join(" ")}
            >
              <span>{t(`ui.programs.${g.category}` as const)}</span>
              <span
                className={[
                  "font-mono text-[0.7rem] tabular-nums",
                  isActive ? "text-white/80" : "text-ink-500",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel — only one shown on screen */}
      <div
        role="tabpanel"
        id={`panel-prog-${current.category}`}
        aria-labelledby={`tab-prog-${current.category}`}
        className="no-print surface p-6 sm:p-8"
      >
          {current.items.length === 0 ? (
            <p className="text-sm text-ink-500">{t("ui.programsEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {current.items.map((p, i) => {
                const isInternal = p.href.startsWith("/");
                const cardClass =
                  "group flex items-start justify-between gap-4 rounded-lg border border-ink-200 bg-white p-4 transition hover:border-accent hover:shadow-sm";
                const inner = (
                  <>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-ink-900 group-hover:text-accent">
                        {p.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {p.tags?.map((tag) => (
                          <span key={tag} className="chip-muted">{tag}</span>
                        ))}
                        {p.date ? (
                          <span className="font-mono text-xs text-ink-500">
                            {formatDate(p.date, lang)}
                          </span>
                        ) : null}
                      </div>
                      {p.description ? (
                        <p className="mt-1 text-sm text-ink-700">{p.description}</p>
                      ) : null}
                      <p className="mt-1 truncate text-xs text-ink-500">{p.href}</p>
                    </div>
                    <span className="mt-1 shrink-0 text-ink-500 transition group-hover:text-accent">
                      {isInternal ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={i}>
                    {isInternal ? (
                      <Link href={p.href} className={cardClass}>
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cardClass}
                      >
                        {inner}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
      </div>

      {/* All groups expanded for print */}
      <div className="hidden print:block">
        {groups.map((g, i) => (
          <div key={g.category} className={i > 0 ? "print-page-break pt-2" : ""}>
            <h2 className="h-section mb-3">{t(`ui.programs.${g.category}` as const)}</h2>
            {g.items.length === 0 ? (
              <p className="text-sm text-ink-500">{t("ui.programsEmpty")}</p>
            ) : (
              <ul className="space-y-3">
                {g.items.map((p, j) => (
                  <li key={j} className="surface p-4">
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    {p.description ? (
                      <p className="mt-1 text-sm">{p.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs">{p.href}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
