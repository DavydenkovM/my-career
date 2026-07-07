"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import type { MediaItem } from "@/content/loader";

function inferType(item: MediaItem): "image" | "video" {
  if (item.type) return item.type;
  return /\.(mp4|mov|webm)$/i.test(item.src) ? "video" : "image";
}

export function MediaGallery({ items }: { items: MediaItem[] }) {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const hasItems = items.length > 0;
  const open = openIndex !== null;
  const current = open ? items[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + items.length) % items.length
      ),
    [items.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next, prev]);

  if (!hasItems) {
    return (
      <p className="text-sm italic text-ink-500">{t("ui.mediaEmpty")}</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => {
          const type = inferType(item);
          const thumb = item.poster ?? item.src;
          return (
            <button
              key={item.src + i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative overflow-hidden rounded-lg border border-ink-200 bg-paper-deep text-left transition hover:border-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt={item.alt ?? item.caption ?? ""}
                className="aspect-[9/16] w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
              {type === "video" ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              ) : null}
              {item.caption ? (
                <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] font-medium text-white">
                  {item.caption}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {open && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? "Media"}
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <div
            className="relative flex max-h-[95vh] w-full max-w-5xl flex-col items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t("ui.close")}
              className="absolute -top-2 right-0 z-10 -translate-y-full rounded-md bg-white/90 px-3 py-1 text-sm font-semibold text-ink-900 shadow hover:bg-white"
            >
              ✕ {t("ui.close")}
            </button>

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label={t("ui.prev")}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink-900 shadow hover:bg-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={t("ui.next")}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink-900 shadow hover:bg-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            ) : null}

            <div className="flex max-h-[85vh] items-center justify-center overflow-hidden rounded-lg bg-black">
              {inferType(current) === "video" ? (
                <video
                  key={current.src}
                  src={current.src}
                  poster={current.poster}
                  controls
                  autoPlay
                  className="max-h-[85vh] w-auto max-w-full"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.alt ?? current.caption ?? ""}
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-white/80">
              <span className="truncate">
                {current.caption ?? current.alt ?? ""}
              </span>
              {items.length > 1 ? (
                <span className="font-mono tabular-nums">
                  {(openIndex ?? 0) + 1} / {items.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
