"use client";

import { useEffect, useMemo, useState } from "react";
import { PILOT_CHAPTERS, READY_SCORE } from "@/content/editor";
import { isReady, openNotes, stateOf, STATE_CLASS, STATE_LABEL, waitsForEditor, type Chapter, type Decision, type Review, type State } from "./model";

type Props = { chapters: Chapter[]; reviews: Record<string, Review>; decisions: Record<string, Decision>; source: string };

const FILTERS: [string, string][] = [
  ["all", "Все"],
  ["pilot", "Пилот"],
  ["waiting", "Ждёт меня"],
  ["low", `Ниже ${READY_SCORE}`],
  ["video", "Нет видео"],
];

function Badge({ state }: { state: State }) {
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs ${STATE_CLASS[state]}`}>{STATE_LABEL[state]}</span>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded border border-stone-200 bg-white p-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
}

export function Board({ chapters, reviews, decisions, source }: Props) {
  const [filter, setFilter] = useState("all");
  const [byScore, setByScore] = useState(false);

  useEffect(() => {
    try {
      setFilter(localStorage.getItem("editor-filter") ?? "all");
    } catch {
      /* the filter just starts from the default */
    }
  }, []);

  const choose = (value: string) => {
    setFilter(value);
    try {
      localStorage.setItem("editor-filter", value);
    } catch {
      /* the choice lasts until the page closes */
    }
  };

  const lessons = chapters.filter(({ lesson }) => lesson);
  const ready = chapters.filter((chapter) => isReady(chapter, reviews[chapter.slug], decisions[chapter.slug])).length;
  const bookDone = chapters.filter((chapter) => stateOf(chapter, decisions[chapter.slug], "book") === "approved").length;
  const practiceDone = lessons.filter((chapter) => stateOf(chapter, decisions[chapter.slug], "practice") === "approved").length;
  const passing = chapters.filter(({ slug }) => (reviews[slug]?.score ?? 0) >= READY_SCORE).length;

  const shown = useMemo(() => {
    const list = chapters.filter((chapter) => {
      if (filter === "pilot") return PILOT_CHAPTERS.includes(chapter.slug);
      if (filter === "waiting") return waitsForEditor(chapter, decisions[chapter.slug]);
      if (filter === "low") return (reviews[chapter.slug]?.score ?? 0) < READY_SCORE;
      if (filter === "video") return chapter.lesson && chapter.lesson.screencasts === 0;
      return true;
    });

    return byScore ? [...list].sort((a, b) => (reviews[a.slug]?.score ?? 0) - (reviews[b.slug]?.score ?? 0)) : list;
  }, [chapters, reviews, decisions, filter, byScore]);

  let part = "";

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value={`${ready} из ${chapters.length}`} label="глав готово" />
        <Stat value={`${passing} из ${chapters.length}`} label={`балл ${READY_SCORE} и выше`} />
        <Stat value={`${bookDone} из ${chapters.length}`} label="книга утверждена" />
        <Stat value={`${practiceDone} из ${lessons.length}`} label="уроки утверждены" />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => choose(value)}
            className={`rounded border px-3 py-1.5 text-sm ${filter === value ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white"}`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-stone-600">
          <input id="editor-sort" type="checkbox" checked={byScore} onChange={(e) => setByScore(e.target.checked)} />
          сначала слабые
        </label>
      </div>

      <div className="overflow-x-auto rounded border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
              <th className="px-3 py-2 font-medium">Глава</th>
              <th className="px-3 py-2 text-right font-medium">Балл</th>
              <th className="px-3 py-2 font-medium">Книга</th>
              <th className="px-3 py-2 font-medium">Урок</th>
              <th className="px-3 py-2 text-right font-medium">Замечания</th>
              <th className="px-3 py-2 text-right font-medium">Схемы</th>
              <th className="px-3 py-2 text-right font-medium">Слова</th>
            </tr>
          </thead>
          <tbody>
            {shown.flatMap((chapter) => {
              const rows = [];
              const score = reviews[chapter.slug]?.score;
              const notes = openNotes(decisions[chapter.slug]);

              if (!byScore && chapter.part !== part) {
                part = chapter.part;
                rows.push(
                  <tr key={part} className="bg-stone-50">
                    <td colSpan={7} className="px-3 py-1.5 text-xs font-semibold text-stone-500">{part}</td>
                  </tr>,
                );
              }
              rows.push(
                <tr key={chapter.slug} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2">
                    <a className="hover:underline" href={`#${chapter.slug}`}>
                      <span className="mr-2 tabular-nums text-stone-400">{chapter.order}</span>
                      {chapter.title}
                    </a>
                  </td>
                  <td className={`px-3 py-2 text-right font-semibold tabular-nums ${(score ?? 0) >= READY_SCORE ? "text-emerald-700" : "text-red-700"}`}>{score ?? "—"}</td>
                  <td className="px-3 py-2"><Badge state={stateOf(chapter, decisions[chapter.slug], "book")} /></td>
                  <td className="px-3 py-2"><Badge state={stateOf(chapter, decisions[chapter.slug], "practice")} /></td>
                  <td className="px-3 py-2 text-right tabular-nums">{notes || ""}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{chapter.metrics.figures}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{chapter.metrics.words}</td>
                </tr>,
              );
              return rows;
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500">Копия книги из коммита {source}. Оценки агента, ваши решения хранятся в mobile-core-editorial.</p>
    </div>
  );
}
