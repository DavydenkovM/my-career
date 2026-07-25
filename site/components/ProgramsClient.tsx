"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";
import { ProgramsTabs } from "./ProgramsTabs";
import { PageHeader } from "./PageHeader";

export function ProgramsClient() {
  const { lang, t } = useLang();
  const { meta, programs } = getSiteContent(lang);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <PageHeader
        subtitle={t("ui.programsSubtitle")}
        intro={t("ui.programsIntro")}
        showRegalia={false}
        action={
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800 shadow-sm transition hover:border-accent hover:text-accent"
            >
            {t("ui.programsBack")}
          </Link>
        }
      />

      <div className="mt-10">
        <ProgramsTabs groups={programs} />
      </div>

      <footer className="mt-12 border-t border-ink-200 pt-5 text-xs text-ink-500">
        © {new Date().getFullYear()} · {meta.name}
      </footer>
    </div>
  );
}
