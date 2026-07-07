"use client";

import { useMemo } from "react";
import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";
import { Section } from "./Section";
import { TechSection } from "./TechSection";
import { AboutSection } from "./AboutSection";
import { Header } from "./Header";
import { StickyHeader } from "./StickyHeader";
import { Sidebar, type NavGroup } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ExperienceTabs } from "./ExperienceTabs";
import type { Experience } from "@/content/loader";

function yearRangeLabel(
  period: Experience["period"],
  lang: "ru" | "en"
): string {
  const ym = /^(\d{4})/.exec(period.from);
  const fromYear = ym ? Number(ym[1]) : null;
  const toYear = period.present
    ? null
    : period.to
      ? Number(/^(\d{4})/.exec(period.to)?.[1] ?? "NaN")
      : null;
  const presentLabel = lang === "en" ? "now" : "н.в.";
  if (fromYear && toYear) return `${fromYear}–${toYear}`;
  if (fromYear && period.present) return `${fromYear}–${presentLabel}`;
  return `${fromYear ?? toYear ?? ""}`;
}

export function CvClient({ items }: { items: { ru: Experience[]; en: Experience[] } }) {
  const { lang, t } = useLang();
  const list = items[lang];

  const navGroups = useMemo<NavGroup[]>(
    () => [
      { id: "about", label: t("ui.about") },
      {
        id: "experience",
        label: t("ui.experience"),
        children: list.map((item) => ({
          id: `exp-${item.slug}`,
          title: item.company,
          subtitle: yearRangeLabel(item.period, lang),
        })),
      },
      { id: "tech", label: t("ui.tech") },
    ],
    [t, list, lang]
  );

  return (
    <>
      <StickyHeader />
      <div id="top" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16 print:max-w-none print:px-0 print:py-0">
        <Header />
        <div className="mt-10 grid grid-cols-1 gap-x-12 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-x-14 print:block">
          <Sidebar groups={navGroups} />

          <div className="min-w-0 print:max-w-none">
            <Section id="about" title={t("ui.about")}>
              <AboutSection />
            </Section>

            <Section id="experience" title={t("ui.experience")}>
              <ExperienceTabs items={list} />
            </Section>

            <Section id="tech" title={t("ui.tech")}>
              <TechSection />
            </Section>

            <footer className="mt-16 flex flex-col items-start gap-2 border-t border-ink-200 pt-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} · {getSiteContent(lang).meta.name}
              </span>
              <a
                className="link no-print"
                href="https://github.com/DavydenkovM/my-career"
                target="_blank"
                rel="noreferrer noopener"
              >
                {t("ui.openSource")} ↗
              </a>
            </footer>
          </div>
        </div>
      </div>
      <MobileNav groups={navGroups} />
    </>
  );
}
