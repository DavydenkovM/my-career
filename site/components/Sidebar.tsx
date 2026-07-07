"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

export type NavItem = { id: string; title: string; subtitle?: string };
export type NavGroup = {
  id: string;
  label: string;
  children?: NavItem[];
};

type Props = {
  groups: NavGroup[];
  onItemClick?: (id: string) => void;
};

export function Sidebar({ groups, onItemClick }: Props) {
  const { t } = useLang();
  const [active, setActive] = useState<string>(groups[0]?.id ?? "");

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    if (onItemClick) {
      e.preventDefault();
      setActive(id);
      onItemClick(id);
    } else {
      setActive(id);
    }
  };

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
                    onClick={handleClick(g.id)}
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
                              onClick={handleClick(c.id)}
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

      {/* Mobile: see <MobileNav /> rendered in CvClient */}
    </>
  );
}
