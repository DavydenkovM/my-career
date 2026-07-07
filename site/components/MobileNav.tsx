"use client";

import { useEffect, useRef } from "react";
import { useLang } from "./LangProvider";
import type { NavGroup } from "./Sidebar";

type Props = {
  groups: NavGroup[];
  onItemClick?: (id: string) => void;
};

export function MobileNav({ groups, onItemClick }: Props) {
  const { t } = useLang();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Close the menu when the user navigates to a section (we can't observe hashchange
  // before the click, but clicking an anchor inside <details> with toggle behavior
  // will close the panel on mobile because the link itself takes the user away).
  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  // If the viewport grows past the sm breakpoint, force-close (avoids a stale
  // open state if the user rotates the device).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeMenu();
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <details
      ref={detailsRef}
      className="mobile-burger no-print fixed bottom-4 right-4 z-30 sm:hidden"
    >
      <summary
        aria-label={t("ui.nav")}
        title={t("ui.nav")}
        className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full border border-ink-200 bg-paper text-ink-900 shadow-[0_8px_24px_-12px_rgba(20,12,4,0.4)]"
      >
        <span className="burger" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </summary>
      <nav
        aria-label={t("ui.nav")}
        className="absolute bottom-14 right-0 w-72 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto rounded-2xl border border-ink-200 bg-paper/95 p-3 shadow-[0_8px_24px_-12px_rgba(20,12,4,0.45)] backdrop-blur supports-[backdrop-filter]:bg-paper/80"
      >
        <ul className="flex flex-col">
          {groups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                onClick={(e) => {
                  closeMenu();
                  if (onItemClick) {
                    e.preventDefault();
                    onItemClick(g.id);
                  }
                }}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-100"
              >
                {g.label}
              </a>
              {g.children && g.children.length > 0 ? (
                <ul className="mb-1 ml-3 flex flex-col border-l border-ink-200 pl-2">
                  {g.children.map((c) => (
                    <li key={c.id}>
                      <a
                        href={`#${c.id}`}
                        onClick={(e) => {
                          closeMenu();
                          if (onItemClick) {
                            e.preventDefault();
                            onItemClick(c.id);
                          }
                        }}
                        className="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-xs text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                      >
                        {c.subtitle ? (
                          <span className="w-14 shrink-0 font-mono text-[10px] tabular-nums text-ink-400">
                            {c.subtitle}
                          </span>
                        ) : null}
                        <span className="truncate">{c.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          <li>
            <a
              href="#top"
              onClick={closeMenu}
              className="mt-1 block rounded-lg border-t border-ink-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent hover:bg-ink-100"
            >
              ↑ {t("ui.navTop")}
            </a>
          </li>
        </ul>
      </nav>
    </details>
  );
}
