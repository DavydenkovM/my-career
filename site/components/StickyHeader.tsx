"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";
import { asset } from "@/content/asset";
import { LangSwitcher } from "./LangSwitcher";
import { PrintButton } from "./PrintButton";

export function StickyHeader() {
  const { lang } = useLang();
  const { meta } = getSiteContent(lang);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show sticky header after the user scrolls past the full header (~200px).
      setScrolled(window.scrollY > 200);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!scrolled}
      className={[
        "no-print fixed inset-x-0 top-0 z-40 transition-all duration-200",
        scrolled
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0",
      ].join(" ")}
    >
      <div className="border-b border-ink-200 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5 sm:px-8">
          {meta.photo ? (
            <img
              src={asset(meta.photo)}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full border border-ink-200 object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-bold text-ink-900 sm:text-base">
              {meta.name}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-ink-600 sm:text-xs">
              {(meta.rolesEn ?? meta.roles ?? []).map((r, i, arr) => (
                <span key={r} className="inline-flex items-center">
                  {r}
                  {i < arr.length - 1 ? (
                    <span className="ml-1.5 text-ink-300" aria-hidden>·</span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LangSwitcher />
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}
