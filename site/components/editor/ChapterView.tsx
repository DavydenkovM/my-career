"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BOOK_AXES, EDITORIAL_REPO, PRACTICE_AXES, READY_SCORE } from "@/content/editor";
import type { Repo } from "./github";
import { cleanMarkdown, stateOf, STATE_CLASS, STATE_LABEL, type Chapter, type Decision, type Note, type Review, type Target, type Verdict } from "./model";

type Props = { repo: Repo; chapter: Chapter; target: Target; review?: Review; decision?: Decision; onSaved: (decision: Decision) => void };

function RepoImage({ repo, base, src, alt }: { repo: Repo; base: string; src?: string; alt?: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let made = "";
    const path = src.startsWith("../images/") ? `content/images/${src.slice("../images/".length)}` : `${base}/${src}`;

    repo.image(path).then((value) => {
      made = value;
      if (!cancelled) setUrl(value);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [repo, base, src]);

  /* eslint-disable-next-line @next/next/no-img-element */
  return url ? <img src={url} alt={alt ?? ""} className="max-w-full" /> : <span className="block rounded bg-stone-100 p-4 text-xs text-stone-500">{alt}</span>;
}

function Axis({ label, value, weight }: { label: string; value?: number; weight: number }) {
  const known = value !== undefined;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
      <span>{label}</span>
      <span className="tabular-nums text-stone-600">{known ? value : "—"} <span className="text-xs text-stone-400">/ 2 · вес {weight}</span></span>
      <span className="col-span-2 h-1.5 overflow-hidden rounded bg-stone-200">
        <span className={`block h-full ${(value ?? 0) >= 2 ? "bg-emerald-600" : (value ?? 0) >= 1.5 ? "bg-lime-600" : "bg-amber-500"}`} style={{ width: `${((value ?? 0) / 2) * 100}%` }} />
      </span>
    </div>
  );
}

export function ChapterView({ repo, chapter, target, review, decision, onSaved }: Props) {
  const [text, setText] = useState("");
  const [failed, setFailed] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const article = useRef<HTMLElement>(null);

  const practice = target === "practice";
  const hasLesson = Boolean(chapter.lesson);
  const base = `content/practice/${chapter.slug}`;
  const state = stateOf(chapter, decision, target);
  const verdict: Verdict | undefined = decision?.[target];
  const notes = (decision?.comments ?? []).filter((item) => item.target === target);

  useEffect(() => {
    setText("");
    setFailed("");
    if (practice && !hasLesson) return;
    repo.text(practice ? `${base}/README.md` : `content/chapters/${chapter.slug}.md`)
      .then((value) => setText(cleanMarkdown(value)))
      .catch((error: Error) => setFailed(error.message));
  }, [repo, chapter.slug, practice, hasLesson, base]);

  /* The quote survives the tap on the comment field, which clears the selection on a phone */
  useEffect(() => {
    const onSelect = () => {
      const selection = window.getSelection();
      const value = selection?.toString().trim();

      if (value && selection?.anchorNode && article.current?.contains(selection.anchorNode)) setQuote(value);
    };

    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, []);

  const save = async (next: Decision, message: string) => {
    setBusy(true);
    setSaveError("");
    try {
      await repo.save(`decisions/${chapter.slug}.json`, next, message);
      onSaved(next);
      return true;
    } catch (error) {
      setSaveError((error as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const current_ = (): Decision => ({ comments: [], ...decision });

  const decide = async (status: Verdict["status"]) => {
    const hash = practice ? chapter.lesson?.hash : chapter.hash;

    if (!hash) return;
    setBusy(true);
    try {
      const commit = await repo.headCommit();

      await save({ ...current_(), [target]: { status, hash, commit, at: new Date().toISOString() } }, `${chapter.slug}: ${practice ? "practice" : "book"} ${status}`);
    } catch (error) {
      setSaveError((error as Error).message);
      setBusy(false);
    }
  };

  const comment = async (event: React.FormEvent) => {
    event.preventDefault();
    const item: Note = { id: crypto.randomUUID(), target, text: note.trim(), at: new Date().toISOString(), ...(quote ? { quote } : {}) };
    const current = current_();

    if (await save({ ...current, comments: [...current.comments, item] }, `${chapter.slug}: comment on ${target}`)) {
      setNote("");
      setQuote("");
    }
  };

  const toggle = (item: Note) => {
    const current = current_();

    save({ ...current, comments: current.comments.map((one) => (one.id === item.id ? { ...one, resolved: !one.resolved } : one)) }, `${chapter.slug}: comment ${item.resolved ? "reopened" : "resolved"}`);
  };

  const tab = (value: Target, label: string) => (
    <a
      href={`#${chapter.slug}${value === "practice" ? "/practice" : ""}`}
      aria-current={target === value ? "page" : undefined}
      className={`border-b-2 px-3 py-2 text-sm ${target === value ? "border-stone-900 font-medium" : "border-transparent text-stone-600"}`}
    >
      {label}
    </a>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className="grid gap-1">
        <a href="#" className="text-sm text-stone-600 hover:underline">← Все главы</a>
        <h1 className="text-2xl font-semibold">{chapter.order}. {chapter.title}</h1>
        <p className="text-sm text-stone-600">{chapter.part}</p>
      </div>
      <nav className="flex gap-1 border-b border-stone-200">
        {tab("book", "Книга")}
        {tab("practice", "Практика")}
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article ref={article} className="prose prose-stone max-w-none rounded border border-stone-200 bg-white p-5 prose-img:my-4 prose-pre:overflow-x-auto prose-code:before:content-none prose-code:after:content-none">
          {failed && <p className="text-red-700">Не удалось загрузить текст: {failed}</p>}
          {practice && !hasLesson && <p>У этой главы нет урока.</p>}
          {!text && !failed && (!practice || hasLesson) && <p className="text-stone-500">Загружаю…</p>}
          {text && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => <RepoImage repo={repo} base={base} src={src} alt={alt} />,
                table: ({ children }) => <div className="overflow-x-auto"><table>{children}</table></div>,
              }}
            >
              {text}
            </ReactMarkdown>
          )}
        </article>

        <aside className="grid content-start gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <section className="grid gap-3 rounded border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">Оценка</h2>
              <span className={`text-2xl font-semibold tabular-nums ${(review?.score ?? 0) >= READY_SCORE ? "text-emerald-700" : "text-red-700"}`}>{review?.score ?? "—"}</span>
            </div>
            {(practice ? PRACTICE_AXES : BOOK_AXES).map(([key, label, weight]) => <Axis key={key} label={label} value={review?.axes[key]} weight={weight} />)}
            {review && (
              <>
                <p className="text-sm"><b>Что видно.</b> {review.note}</p>
                <p className="text-sm"><b>Что поправить.</b> {review.fix}</p>
                <p className="text-xs text-stone-500">Оценка от {review.date}, оценивал агент.</p>
              </>
            )}
            <p className="text-xs text-stone-500">
              {practice
                ? `${chapter.lesson?.steps ?? 0} шагов · ${chapter.lesson?.frames ?? 0} кадров · ${chapter.lesson?.screencasts ?? 0} видео`
                : `${chapter.metrics.words} слов · ${chapter.metrics.figures} схем · шаблонных заголовков: ${chapter.metrics.templateHeadings}`}
            </p>
          </section>

          {(!practice || hasLesson) && (
            <section className="grid gap-3 rounded border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Решение</h2>
                <span className={`rounded px-2 py-0.5 text-xs ${STATE_CLASS[state]}`}>{STATE_LABEL[state]}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={busy} onClick={() => decide("approved")} className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Утвердить</button>
                <button disabled={busy} onClick={() => decide("changes")} className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-800 disabled:opacity-50">Вернуть</button>
              </div>
              {state === "stale" && verdict && (
                <a className="text-sm underline" target="_blank" rel="noreferrer" href={`https://github.com/${EDITORIAL_REPO}/compare/${verdict.commit}...main`}>Что изменилось с вашего решения</a>
              )}
            </section>
          )}

          {(!practice || hasLesson) && (
            <section className="grid gap-3 rounded border border-stone-200 bg-white p-4">
              <h2 className="font-semibold">Замечания</h2>
              <form onSubmit={comment} className="grid gap-2">
                {quote && (
                  <blockquote className="border-l-2 border-stone-300 pl-2 text-sm text-stone-600">
                    {quote.length > 200 ? `${quote.slice(0, 200)}…` : quote}{" "}
                    <button type="button" className="underline" onClick={() => setQuote("")}>убрать</button>
                  </blockquote>
                )}
                <label className="grid gap-1 text-sm">
                  Выделите текст, чтобы привязать замечание к месту
                  <textarea id="editor-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="rounded border border-stone-300 p-2 text-sm" />
                </label>
                <button disabled={busy || !note.trim()} className="rounded bg-stone-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Сохранить замечание</button>
              </form>
              {saveError && <p className="text-sm text-red-700">{saveError}</p>}
              {notes.map((item) => (
                <div key={item.id} className={`grid gap-1 border-t border-stone-100 pt-2 text-sm ${item.resolved ? "opacity-60" : ""}`}>
                  {item.quote && <blockquote className="border-l-2 border-stone-300 pl-2 text-stone-600">{item.quote}</blockquote>}
                  <p>{item.text}</p>
                  <button disabled={busy} className="justify-self-start text-xs underline" onClick={() => toggle(item)}>{item.resolved ? "Вернуть в работу" : "Закрыть"}</button>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
