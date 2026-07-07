"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";

export type NavItem = { id: string; title: string; subtitle?: string };
export type NavGroup = {
  id: string;
  label: string;
  children?: NavItem[];
};

type Props = {
  groups: NavGroup[];
};

export function Sidebar({ groups }: Props) {
  const { t } = useLang();
  const [active, setActive] = useState<string>(groups[0]?.id ?? "");

  useEffect(() => {
    const allIds = groups.flatMap((g) => [g.id, ...(g.children?.map((c) => c.id) ?? [])]);
    const observed = allIds
      .map((i) => document.getElementById(i))
      .filter((el): el is HTMLElement => el !== null);
    if (observed.length === 0) return;

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId = observed[0].id;
        let bestRatio = -1;
        for (const el of observed) {
          const r = visibility.get(el.id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = el.id;
          }
        }
        if (bestRatio > 0) setActive(bestId);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <>
      {/* Desktop: sticky vertical sidebar */}
      <aside aria-label={t("ui.nav")} className="no-print hidden sm:block">
        <nav className="sticky top-8">
          <div className="h-section mb-4">{t("ui.nav")}</div>
          <ul className="space-y-1 border-l-2 border-ink-200">
            {groups.map((g) => {
              const isActive =
                active === g.id || (g.children?.some((c) => c.id === active) ?? false);
              return (
                <li key={g.id} className="-ml-px">
                  <a
                    href={`#${g.id}`}
                    aria-current={active === g.id ? "true" : undefined}
                    className={[
                      "block border-l-2 py-1.5 pl-3 pr-2 text-sm font-semibold transition",
                      isActive
                        ? "border-accent text-accent"
                        : "border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900",
                    ].join(" ")}
                  >
                    {g.label}
                  </a>
                  {g.children && g.children.length > 0 ? (
                    <ul className="mt-1 space-y-1.5">
                      {g.children.map((c) => {
                        const childActive = active === c.id;
                        return (
                          <li key={c.id} className="-ml-px">
                            <a
                              href={`#${c.id}`}
                              aria-current={childActive ? "true" : undefined}
                              className={[
                                "block border-l-2 py-1 pl-6 pr-2 transition",
                                childActive
                                  ? "border-accent text-accent"
                                  : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "block text-sm font-semibold leading-tight",
                                  childActive ? "" : "text-ink-800",
                                ].join(" ")}
                              >
                                {c.title}
                              </span>
                              {c.subtitle ? (
                                <span className="mt-0.5 block font-mono text-[0.7rem] tabular-nums text-ink-500">
                                  {c.subtitle}
                                </span>
                              ) : null}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile: horizontal scrolling nav strip */}
      <div className="no-print -mx-5 mb-6 overflow-x-auto border-b border-ink-200 px-5 sm:hidden">
        <nav aria-label={t("ui.nav")}>
          <ul className="flex gap-1 whitespace-nowrap py-2">
            {groups.map((g) => {
              const isActive =
                active === g.id || (g.children?.some((c) => c.id === active) ?? false);
              return (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    aria-current={active === g.id ? "true" : undefined}
                    className={[
                      "inline-block rounded-full px-3 py-1 text-xs font-semibold transition",
                      isActive
                        ? "bg-accent text-white"
                        : "text-ink-600 hover:bg-ink-100",
                    ].join(" ")}
                  >
                    {g.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
