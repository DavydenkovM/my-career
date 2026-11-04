"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BOOK_GROUP, EDITORIAL_REPO, PRACTICE_GROUPS, READY_SCORE } from "@/content/editor";
import type { Repo } from "./github";
import { cleanMarkdown, stateOf, STATE_CLASS, STATE_LABEL, type Chapter, type Decision, type Note, type Review, type Rubric, type RubricGroup, type Target, type Verdict } from "./model";

type Props = { repo: Repo; chapter: Chapter; target: Target; rubric: Rubric; review?: Review; decision?: Decision; onSaved: (decision: Decision) => void };

function RepoImage({ repo, base, src, alt }: { repo: Repo; base: string; src?: string; alt?: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const path = src.startsWith("../images/") ? `content/images/${src.slice("../images/".length)}` : `${base}/${src}`;

    repo.image(path).then((value) => {
      if (!cancelled) setUrl(value);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [repo, base, src]);

  /* eslint-disable-next-line @next/next/no-img-element */
  return url ? <img src={url} alt={alt ?? ""} className="max-w-full" /> : <span className="block rounded bg-stone-100 p-4 text-xs text-stone-500">{alt}</span>;
}

/*
 * Memoised on purpose: selecting text and typing a note update the parent on every step.
 * The components must keep their identity, or React remounts every image and refetches it.
 */
const ArticleText = memo(function ArticleText({ repo, base, text }: { repo: Repo; base: string; text: string }) {
  const components = useMemo(() => ({
    img: ({ src, alt }: { src?: string | Blob; alt?: string }) => <RepoImage repo={repo} base={base} src={typeof src === "string" ? src : undefined} alt={alt} />,
    table: ({ children }: { children?: React.ReactNode }) => <div className="overflow-x-auto"><table>{children}</table></div>,
  }), [repo, base]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text}</ReactMarkdown>;
});

const barColor = (value: number) => (value >= 75 ? "bg-emerald-600" : value >= 60 ? "bg-lime-600" : value >= 40 ? "bg-amber-500" : "bg-red-500");

function Bar({ value }: { value: number }) {
  return (
    <span className="col-span-2 block h-1.5 overflow-hidden rounded bg-stone-200">
      <span className={`block h-full ${barColor(value)}`} style={{ width: `${value}%` }} />
    </span>
  );
}

function Group({ group, review }: { group: RubricGroup; review?: Review }) {
  const value = review?.groups?.[group.key];
  const items = group.items.filter(({ id }) => review?.items[id] !== undefined);

  return (
    <details className="group text-sm">
      <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
        <span>{group.label}</span>
        <span className="tabular-nums text-stone-600">{value ?? "—"} <span className="text-xs text-stone-400">/ 100 · вес {group.weight}</span></span>
        <Bar value={value ?? 0} />
      </summary>
      <div className="mt-2 grid gap-2 border-l-2 border-stone-200 pl-3">
        {items.map(({ id, label, kind }) => (
          <div key={id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-xs">
            <span>{label}{kind === "Ч" ? "" : <span className="text-stone-400"> · {kind === "А" ? "измерено" : "по скелету"}</span>}</span>
            <span className="tabular-nums text-stone-600">{review?.items[id]}</span>
            <Bar value={review?.items[id] ?? 0} />
          </div>
        ))}
      </div>
    </details>
  );
}

export function ChapterView({ repo, chapter, target, rubric, review, decision, onSaved }: Props) {
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
          {text && <ArticleText repo={repo} base={base} text={text} />}
        </article>

        <aside className="grid content-start gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <section className="grid gap-3 rounded border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">Оценка</h2>
              <span className={`text-2xl font-semibold tabular-nums ${(review?.score ?? 0) >= READY_SCORE ? "text-emerald-700" : "text-red-700"}`}>{review?.score ?? "—"}</span>
            </div>
            {practice && review?.practice && <PracticeGate gate={review.practice} />}
            {rubric.groups.filter(({ key }) => key !== BOOK_GROUP && PRACTICE_GROUPS.includes(key) === practice).map((group) => <Group key={group.key} group={group} review={review} />)}
            {review && (
              <>
                <p className="text-sm"><b>Что видно.</b> {review.note}</p>
                {review.weak && review.weak.length > 0 && (
                  <div className="text-sm">
                    <b>Слабее всего.</b>
                    <ul className="ml-4 list-disc">{review.weak.map(({ id, reason }) => <li key={id}>{reason}</li>)}</ul>
                  </div>
                )}
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

/* Whether the lesson may be read at all, and which part of it pulls it down */
function PracticeGate({ gate }: { gate: NonNullable<Review["practice"]> }) {
  const mean = (scores: Record<string, number>) => {
    const values = Object.values(scores);

    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : undefined;
  };

  return (
    <div className="grid gap-2 text-sm">
      <p className={gate.ready ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
        {gate.ready
          ? "Практика прошла стоп-пункты"
          : `Практика не готова: ${gate.reviewed ? `стоп-пункты ${gate.stops.join(", ")}` : "нет проверки глазами новичка"}`}
      </p>
      {gate.parts.length > 0 && (
        <table className="w-full text-xs">
          <tbody>
            {gate.parts.map((part) => {
              const value = mean(part.scores);

              return (
                <tr key={part.title} className="border-t border-stone-100 align-top">
                  <td className="py-1 pr-2">{part.title}<div className="text-stone-500">{part.note}</div></td>
                  <td className={`py-1 text-right tabular-nums ${(value ?? 0) >= 60 ? "text-emerald-700" : "text-red-700"}`}>{value ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {gate.lint.length > 0 && (
        <details>
          <summary className="cursor-pointer">lesson:lint · {gate.lint.length}</summary>
          <ul className="ml-4 list-disc text-xs">{gate.lint.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
      )}
    </div>
  );
}
