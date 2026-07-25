"use client";

import { useEffect, useRef } from "react";
import { getGiscusConfig } from "@/content/giscus";
import { useLang } from "./LangProvider";

type Props = {
  term?: string;
};

export function Comments({ term: _term }: Props = {}) {
  const { lang, t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const config = getGiscusConfig();

  useEffect(() => {
    if (!config || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", config.repo);
    script.setAttribute("data-repo-id", config.repoId);
    script.setAttribute("data-category", config.category);
    script.setAttribute("data-category-id", config.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-loading", "lazy");

    containerRef.current.appendChild(script);
  }, [config, lang]);

  if (!config) {
    return null;
  }

  return (
    <section className="no-print surface mt-8 p-6 sm:p-8">
      <h2 className="h-section mb-4">{t("ui.comments")}</h2>
      <p className="mb-4 text-sm text-ink-700">{t("ui.commentsHint")}</p>
      <div ref={containerRef} className="giscus" />
    </section>
  );
}
