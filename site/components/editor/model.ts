import { READY_SCORE } from "@/content/editor";

export type LessonInfo = { hash: string; words: number; steps: number; frames: number; screencasts: number; assets: string[] };

export type Chapter = {
  slug: string;
  part: string;
  order: number;
  title: string;
  hash: string;
  metrics: { words: number; figures: number; wordsPerFigure: number; templateHeadings: number; formulaLead: boolean };
  lesson?: LessonInfo;
};

export type Review = {
  rubric: string;
  date: string;
  by: string;
  score: number;
  groups?: Record<string, number>;
  items: Record<string, number>;
  weak?: { id: string; reason: string }[];
  note: string;
  fix: string;
};

export type RubricItem = { id: string; weight: number; kind: string; label: string; source: string };
export type RubricGroup = { key: string; label: string; weight: number; items: RubricItem[] };
export type Rubric = { id: string; groups: RubricGroup[] };

export type Target = "book" | "practice";

export type Verdict = { status: "approved" | "changes"; hash: string; commit: string; at: string };

export type Note = { id: string; target: Target; quote?: string; text: string; at: string; resolved?: boolean };

export type Decision = { book?: Verdict; practice?: Verdict; comments: Note[] };

export type State = "pending" | "approved" | "changes" | "stale" | "none";

export const STATE_LABEL: Record<State, string> = {
  pending: "ждёт",
  approved: "утверждено",
  changes: "на доработке",
  stale: "изменилось",
  none: "нет урока",
};

export const STATE_CLASS: Record<State, string> = {
  pending: "bg-stone-100 text-stone-700",
  approved: "bg-emerald-100 text-emerald-800",
  changes: "bg-red-100 text-red-800",
  stale: "bg-amber-100 text-amber-800",
  none: "text-stone-400",
};

export function stateOf(chapter: Chapter, decision: Decision | undefined, target: Target): State {
  const hash = target === "book" ? chapter.hash : chapter.lesson?.hash;

  if (!hash) return "none";
  const verdict = decision?.[target];

  if (!verdict) return "pending";
  return verdict.hash === hash ? verdict.status : "stale";
}

export const isReady = (chapter: Chapter, review: Review | undefined, decision: Decision | undefined) =>
  (review?.score ?? 0) >= READY_SCORE &&
  stateOf(chapter, decision, "book") === "approved" &&
  ["approved", "none"].includes(stateOf(chapter, decision, "practice"));

export const waitsForEditor = (chapter: Chapter, decision: Decision | undefined) =>
  (["book", "practice"] as Target[]).some((target) => ["pending", "stale"].includes(stateOf(chapter, decision, target)));

export const openNotes = (decision: Decision | undefined) => decision?.comments.filter((note) => !note.resolved).length ?? 0;

/* Book markdown to plain markdown: no front matter, title (the page shows it), comments or wikilinks */
export function cleanMarkdown(text: string) {
  return text
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^\s*# .+$/m, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[\[([^\]|\\]+)\\?\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, (_, link: string) => link.split("/").pop() ?? link);
}
