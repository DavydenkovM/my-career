"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useLang } from "./LangProvider";
import { LangSwitcher } from "./LangSwitcher";
import { PrintButton } from "./PrintButton";
import { Comments } from "./Comments";
import { asset } from "@/content/asset";
import {
  getArticle,
  type Article,
  type ArticleBlock,
} from "@/content/articles/mobile-landscape-2026";

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

type Slide = { src: string; alt: string };

export function ArticleClient({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const article: Article | null = getArticle(slug, lang);

  const back = t("ui.programsBack").replace(/^←\s*/, "");

  const imageIndexes = useMemo(() => {
    if (!article) return [];
    const idxs: number[] = [];
    article.blocks.forEach((b, i) => {
      if (b.type === "img") idxs.push(i);
    });
    return idxs;
  }, [article]);

  const slides: Slide[] = useMemo(() => {
    if (!article) return [];
    return imageIndexes.map((i) => {
      const b = article.blocks[i] as Extract<ArticleBlock, { type: "img" }>;
      return {
        src: asset(`${article.imageBase}/${b.src}`),
        alt: b.alt,
      };
    });
  }, [article, imageIndexes]);

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  if (!article) return null;

  const imagePosInSlides = (blockIndex: number) =>
    imageIndexes.indexOf(blockIndex);

  const renderBlock = (block: ArticleBlock, idx: number) => {
    if (block.type === "p") {
      return (
        <p key={idx} className="text-[1.05rem] leading-relaxed text-ink-800">
          {renderInline(block.text)}
        </p>
      );
    }
    const slidePos = imagePosInSlides(idx);
    return (
      <figure key={idx} className="my-2">
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
      </figure>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="no-print mt-6">
        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 transition hover:text-accent"
        >
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {back}
        </Link>
      </div>

      <header className="mt-6 space-y-4">
        <h1 className="h-name text-3xl leading-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <div className="no-print flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <LangSwitcher />
            <PrintButton compact />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {article.date ? (
              <span className="font-mono text-ink-500">{article.date}</span>
            ) : null}
            {article.tag ? <span className="chip-muted">{article.tag}</span> : null}
          </div>
        </div>

        {article.lead ? (
          <p className="text-base text-ink-700 sm:text-lg">{article.lead}</p>
        ) : null}
      </header>

      <article className="surface mt-8 space-y-5 p-6 sm:p-8 print:shadow-none">
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
