"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Language } from "@/content/i18n";
import { useLang } from "./LangProvider";
import { LangSwitcher } from "./LangSwitcher";
import { PrintButton } from "./PrintButton";
import { Comments } from "./Comments";
import { asset } from "@/content/asset";
import { formatDate, type Article, type ArticleBlock, type TabItem } from "@/content/articles/types";

function renderInline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <strong key={key++} className="font-semibold text-ink-900">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderInlineWithCode(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(renderInline(text.slice(last, m.index)));
    if (m[1].startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-ink-900">
          {m[1].slice(2, -2)}
        </strong>,
      );
    } else if (m[1].startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[0.92em] text-ink-900"
        >
          {m[1].slice(1, -1)}
        </code>,
      );
    } else {
      const linkText = m[2];
      const href = m[3];
      const isExternal = /^https?:\/\//.test(href);
      parts.push(
        <Link
          key={key++}
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-accent underline underline-offset-2 hover:opacity-80"
        >
          {linkText}
        </Link>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(renderInline(text.slice(last)));
  return parts;
}

type Slide = { src: string; alt: string };

type IframeBlockProps = {
  block: Extract<ArticleBlock, { type: "iframe" }>;
  article: Article;
  t: (key: string) => string;
};

function IframeBlock({ block, article, t }: IframeBlockProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(block.height ?? null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== ref.current?.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (data && data.type === "infographic-height" && typeof data.height === "number") {
        setHeight(data.height);
      }
      if (data && data.type === "infographic-ready") {
        sendWidth();
      }
    }
    window.addEventListener("message", onMessage);

    function sendWidth() {
      const win = ref.current?.contentWindow;
      if (!win) return;
      const w = ref.current!.offsetWidth;
      win.postMessage({ type: "infographic-width", width: w }, "*");
    }

    function onResize() {
      sendWidth();
    }
    window.addEventListener("resize", onResize);
    // Retry a few times so we don't lose the race with the iframe's script
    // load — contentWindow isn't available until the iframe parses, and the
    // message listener must be installed before the iframe sends "ready".
    [0, 60, 200, 600, 1500].forEach((d) => setTimeout(sendWidth, d));

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <figure className="my-6">
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-ink-200 bg-paper-deep">
        <iframe
          ref={ref}
          src={asset(`${article.imageBase}/${block.src}`)}
          title={block.title ?? block.caption ?? ""}
          className="block w-full bg-[#0f1115]"
          style={{
            height: height ? `${height}px` : `${block.height ?? 600}px`,
            border: 0,
          }}
        />
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        {block.caption ? (
          <figcaption className="text-sm text-ink-600">{block.caption}</figcaption>
        ) : (
          <span />
        )}
        <a
          href={asset(`${article.imageBase}/${block.src}`)}
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 text-xs text-ink-500 hover:text-accent"
        >
          {t("ui.openFull")}
        </a>
      </div>
    </figure>
  );
}

type TabPanelProps = {
  items: TabItem[];
  article: Article;
  renderBlock: (b: ArticleBlock, idx: number) => React.ReactNode;
  t: (key: string) => string;
};

function TabPanel({ items, article, renderBlock, t }: TabPanelProps) {
  const [active, setActive] = useState(0);
  const item = items[active];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (data && data.type === "infographic-height" && typeof data.height === "number") {
        setIframeHeight(data.height);
      }
      if (data && data.type === "infographic-ready" && iframeRef.current) {
        const w = iframeRef.current.offsetWidth;
        iframeRef.current.contentWindow?.postMessage(
          { type: "infographic-width", width: w },
          "*",
        );
      }
    }
    window.addEventListener("message", onMessage);

    function onResize() {
      if (!iframeRef.current?.contentWindow) return;
      const w = iframeRef.current.offsetWidth;
      iframeRef.current.contentWindow.postMessage(
        { type: "infographic-width", width: w },
        "*",
      );
    }
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  if (!item) return null;
  return (
    <div className="no-print my-4 overflow-x-auto overflow-y-hidden rounded-lg border border-ink-200 bg-paper-deep">
      <div
        role="tablist"
        aria-label="Infographics"
        className="flex flex-wrap gap-1 border-b border-ink-200 bg-white px-2 py-2"
      >
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${i}`}
              id={`tab-${i}`}
              onClick={() => {
                setActive(i);
                setIframeHeight(null);
              }}
              className={[
                "rounded-full px-3 py-1 text-sm font-semibold transition",
                isActive
                  ? "bg-accent text-white"
                  : "text-ink-700 hover:bg-paper-deep hover:text-accent",
              ].join(" ")}
            >
              {it.label}
            </button>
          );
        })}
        {item.kind === "iframe" ? (
          <a
            href={asset(`${article.imageBase}/${item.src}`)}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-auto self-center px-2 text-xs text-ink-500 hover:text-accent"
          >
            {t("ui.openFull")}
          </a>
        ) : null}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {item.kind === "iframe" ? (
          <iframe
            key={active}
            ref={iframeRef}
            src={asset(`${article.imageBase}/${item.src}`)}
            title={item.title ?? item.label}
            className="block w-full bg-[#0f1115]"
            style={{
              height: iframeHeight ? `${iframeHeight}px` : "600px",
              border: 0,
            }}
          />
        ) : (
          <div className="space-y-4 bg-white p-5 sm:p-7">
            {item.blocks.map((b, i) => (
              <div key={i}>{renderBlock(b, i)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArticleClient({
  articles,
}: {
  articles: Record<Language, Article>;
}) {
  const { lang, t } = useLang();
  const article: Article | null = articles?.[lang] ?? null;

  const back = t("ui.programsBack");

  const imageIndexes = useMemo(() => {
    if (!article) return [];
    const idxs: number[] = [];
    article.blocks.forEach((b, i) => {
      if (b.type === "img" || b.type === "img-row") idxs.push(i);
    });
    return idxs;
  }, [article]);

  const slides: Slide[] = useMemo(() => {
    if (!article) return [];
    const out: Slide[] = [];
    article.blocks.forEach((b) => {
      if (b.type === "img") {
        out.push({
          src: asset(`${article.imageBase}/${b.src}`),
          alt: b.alt,
        });
      } else if (b.type === "img-row") {
        b.items.forEach((it) => {
          out.push({
            src: asset(`${article.imageBase}/${it.src}`),
            alt: it.alt,
          });
        });
      }
    });
    return out;
  }, [article]);

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  if (!article) return null;

  const imagePosInSlides = (blockIndex: number) =>
    imageIndexes.indexOf(blockIndex);

  const renderBlock = (block: ArticleBlock, idx: number) => {
    if (block.type === "p") {
      return <p key={idx}>{renderInlineWithCode(block.text)}</p>;
    }
    if (block.type === "h2") {
      return <h2 key={idx}>{block.text}</h2>;
    }
    if (block.type === "h3") {
      return <h3 key={idx}>{block.text}</h3>;
    }
    if (block.type === "ul") {
      return (
        <ul key={idx}>
          {block.items.map((it, i) => (
            <li key={i}>{renderInlineWithCode(it)}</li>
          ))}
        </ul>
      );
    }
    if (block.type === "ol") {
      return (
        <ol key={idx}>
          {block.items.map((it, i) => (
            <li key={i}>{renderInlineWithCode(it)}</li>
          ))}
        </ol>
      );
    }
    if (block.type === "table") {
      return (
        <div
          key={idx}
          className="overflow-x-auto rounded-lg border border-ink-200 bg-white"
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep">
              <tr>
                {block.head.map((c, i) => (
                  <th key={i} className="px-3 py-2 font-semibold text-ink-900">
                    {renderInlineWithCode(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-ink-200 last:border-b-0">
                  {row.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-ink-800">
                      {renderInlineWithCode(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (block.type === "tabs") {
      return (
        <TabPanel
          key={idx}
          items={block.items}
          article={article}
          renderBlock={renderBlock}
          t={t}
        />
      );
    }
    if (block.type === "callout") {
      const tone = block.tone ?? "info";
      const toneClass =
        tone === "warn"
          ? "border-accent-deep/60 bg-accent-soft/30"
          : "border-accent bg-accent-soft/40";
      return (
        <aside
          key={idx}
          className={`my-6 rounded-xl border-l-4 ${toneClass} px-5 py-4 sm:px-6 sm:py-5`}
        >
          {block.title ? (
            <div className="mb-2 text-base font-bold uppercase tracking-[0.08em] text-accent-deep sm:text-lg">
              {renderInlineWithCode(block.title)}
            </div>
          ) : null}
          <div className="text-base leading-relaxed text-ink-800 sm:text-lg">
            {renderInlineWithCode(block.body)}
          </div>
        </aside>
      );
    }
    if (block.type === "link-card") {
      return (
        <Link
          key={idx}
          href={block.href}
          className="my-4 flex items-start gap-3 rounded-xl border border-ink-200 bg-paper-deep p-4 transition hover:border-accent hover:bg-accent-soft/30 sm:p-5"
        >
          <span aria-hidden="true" className="mt-0.5 text-accent">→</span>
          <span className="flex-1">
            <span className="block text-base font-bold text-ink-900 sm:text-lg">
              {block.title}
            </span>
            {block.description ? (
              <span className="mt-1 block text-sm leading-relaxed text-ink-700 sm:text-base">
                {block.description}
              </span>
            ) : null}
          </span>
        </Link>
      );
    }
    if (block.type === "code") {
      return (
        <pre
          key={idx}
          className="my-4 overflow-x-auto rounded-lg border border-ink-200 bg-paper-deep p-4 text-sm leading-relaxed text-ink-900 sm:p-5"
        >
          <code className="font-mono whitespace-pre">{block.text}</code>
        </pre>
      );
    }
    if (block.type === "img-row") {
      const slideOffset = slides.findIndex(
        (s) =>
          s.src ===
          asset(`${article.imageBase}/${block.items[0]?.src ?? ""}`),
      );
      return (
        <div
          key={idx}
          className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        >
          {block.items.map((it, i) => (
            <figure key={i}>
              <button
                type="button"
                onClick={() => setLightboxIndex(slideOffset >= 0 ? slideOffset + i : -1)}
                aria-label={it.alt}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-lg border border-ink-200 bg-paper-deep transition hover:border-accent"
              >
                <img
                  src={asset(`${article.imageBase}/${it.src}`)}
                  alt={it.alt}
                  className="w-full transition group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </button>
              <figcaption>{it.caption}</figcaption>
            </figure>
          ))}
        </div>
      );
    }
    if (block.type === "iframe") {
      return (
        <IframeBlock
          key={idx}
          block={block}
          article={article}
          t={t}
        />
      );
    }
    const slidePos = imagePosInSlides(idx);
    return (
      <figure key={idx}>
        <button
          type="button"
          onClick={() => setLightboxIndex(slidePos)}
          aria-label={block.alt}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-lg border border-ink-200 bg-paper-deep transition hover:border-accent"
        >
          <img
            src={asset(`${article.imageBase}/${block.src}`)}
            alt={block.alt}
            className="w-full transition group-hover:scale-[1.01]"
            loading="lazy"
          />
        </button>
        <figcaption>{block.caption}</figcaption>
      </figure>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <nav
        aria-label="Breadcrumb"
        className="no-print mt-6 flex flex-wrap items-center gap-1.5 text-sm"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="text-ink-500 transition hover:text-accent"
            >
              {t("ui.crumbsHome")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-300">/</li>
          <li>
            <Link
              href="/programs#articles"
              className="text-ink-500 transition hover:text-accent"
            >
              {t("ui.crumbsArticles")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-300">/</li>
          <li className="font-semibold text-ink-800">{article.title}</li>
        </ol>
      </nav>

      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h1 className="h-name text-3xl leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          {article.date ? (
            <span className="shrink-0 font-mono text-sm text-ink-500">
              {formatDate(article.date, lang)}
            </span>
          ) : null}
        </div>

        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {article.tags?.map((tag) => (
              <span key={tag} className="chip-muted">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <LangSwitcher />
            <PrintButton compact />
          </div>
        </div>

        {article.lead ? (
          <p className="max-w-prose text-lg leading-relaxed text-ink-700 sm:text-xl">
            {article.lead}
          </p>
        ) : null}
      </header>

      <article className="prose prose-lg surface mx-auto mt-10 w-full max-w-5xl p-6 sm:p-10 print:shadow-none">
        {article.blocks.map((b, i) => renderBlock(b, i))}
      </article>

      <Comments />

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}