"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { ExperienceItem } from "./ExperienceItem";
import type { Experience } from "@/content/loader";

type Props = {
  items: Experience[];
};

function yearOf(ym: string | undefined): number | null {
  if (!ym) return null;
  const m = /^(\d{4})/.exec(ym);
  return m ? Number(m[1]) : null;
}

function yearLabel(period: Experience["period"], lang: "ru" | "en"): string {
  const from = yearOf(period.from);
  const to = period.present ? null : yearOf(period.to);
  const present = lang === "en" ? "now" : "н.в.";
  if (from && to) return `${from}–${to}`;
  if (from && period.present) return `${from}–${present}`;
  return `${from ?? to ?? ""}`;
}

function readInitialTab(slugs: string[]): string {
  if (typeof window === "undefined") return slugs[0] ?? "";
  const hash = window.location.hash.replace(/^#/, "");
  const m = /^exp-(.+)$/.exec(hash);
  if (m && slugs.includes(m[1])) return m[1];
  return slugs[0] ?? "";
}

export function ExperienceTabs({ items }: Props) {
  const slugs = items.map((i) => i.slug);
  const [active, setActive] = useState<string>(slugs[0] ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();

  useEffect(() => {
    setActive(readInitialTab(slugs));
  }, [slugs.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => setActive(readInitialTab(slugs));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [slugs]);

  function select(slug: string) {
    setActive(slug);
    if (typeof window !== "undefined") {
      const newHash = `#exp-${slug}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, "", newHash);
      }
    }
  }

  const current = items.find((i) => i.slug === active) ?? items[0];

  return (
    <div>
      {/* Tabs: hidden on print — tag cloud that wraps */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Experience"
        className="no-print mb-7 flex flex-wrap gap-2"
      >
        {items.map((item) => {
          const isActive = item.slug === active;
          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.slug}`}
              id={`tab-${item.slug}`}
              onClick={() => select(item.slug)}
              className={[
                "group inline-flex items-baseline gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition active:scale-[0.98]",
                isActive
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-ink-200 bg-white text-ink-800 hover:border-accent hover:text-accent",
              ].join(" ")}
            >
              <span>{item.company}</span>
              <span
                className={[
                  "font-mono text-[0.7rem] tabular-nums",
                  isActive ? "text-white/80" : "text-ink-500",
                ].join(" ")}
              >
                {yearLabel(item.period, lang === "en" ? "en" : "ru")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel — only one shown on screen */}
      {current ? (
        <div
          role="tabpanel"
          id={`panel-${current.slug}`}
          aria-labelledby={`tab-${current.slug}`}
          className="no-print surface p-6 sm:p-8"
        >
          <div id={`exp-${current.slug}`}>
            <ExperienceItem item={current} />
          </div>
        </div>
      ) : null}

      {/* All items expanded for print */}
      <div className="hidden print:block">
        {items.map((item, i) => (
          <div
            key={item.slug}
            id={`exp-${item.slug}`}
            className={i > 0 ? "print-page-break pt-2" : ""}
          >
            <ExperienceItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
