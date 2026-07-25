import type { Language } from "@/content/i18n";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; anchor?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "img"; src: string; alt: string; caption: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | {
      type: "tabs";
      items: TabItem[];
    };

export type TabItem =
  | { kind: "iframe"; label: string; src: string; title?: string; height?: number }
  | { kind: "markdown"; label: string; blocks: ArticleBlock[] };

export type Article = {
  slug: string;
  title: string;
  lead?: string;
  date?: string;
  tags?: string[];
  imageBase: string;
  blocks: ArticleBlock[];
};

export function formatDate(iso: string | undefined, lang: Language): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function parseArticle(md: string, imgAlt: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const lines = md.split("\n");
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) blocks.push({ type: "p", text });
    buf = [];
  };

  const flushTable = (state: {
    head: string[];
    rows: string[][];
  } | null): typeof state => {
    if (state) blocks.push({ type: "table", head: state.head, rows: state.rows });
    return null;
  };

  const flushList = (state: { kind: "ul" | "ol"; items: string[] } | null): typeof state => {
    if (state) blocks.push({ type: state.kind, items: state.items });
    return null;
  };

  let table: { head: string[]; rows: string[][] } | null = null;
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const isTableDivider = (l: string): boolean =>
    /^\s*\|?[\s:|-]+\|?\s*$/.test(l);

  const splitRow = (l: string): string[] =>
    l
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const ulItem = (l: string): string | null => {
    const m = /^[-*]\s+(.+)$/.exec(l.trim());
    return m ? m[1] : null;
  };
  const olItem = (l: string): string | null => {
    const m = /^\d+\.\s+(.+)$/.exec(l.trim());
    return m ? m[1] : null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const imgMatch = /^\[(?:картинка|image):\s*(.+?)(?:\s*\|\s*(.+))?\]$/i.exec(trimmed);
    const h3Match = /^###\s+(.+)$/.exec(trimmed);
    const h2Match = /^##\s+(.+)$/.exec(trimmed);

    if (imgMatch) {
      flush();
      table = flushTable(table);
      list = flushList(list);
      blocks.push({
        type: "img",
        src: imgMatch[1],
        alt: imgMatch[2]?.trim() || imgAlt,
        caption: imgMatch[2]?.trim() || imgAlt,
      });
      continue;
    }

    if (h3Match) {
      flush();
      table = flushTable(table);
      list = flushList(list);
      blocks.push({ type: "h3", text: h3Match[1].trim() });
      continue;
    }

    if (h2Match) {
      flush();
      table = flushTable(table);
      list = flushList(list);
      blocks.push({ type: "h2", text: h2Match[1].trim() });
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = splitRow(trimmed);
      if (table && isTableDivider(trimmed)) {
        continue;
      }
      if (!table) {
        flush();
        list = flushList(list);
        table = { head: cells, rows: [] };
      } else {
        table.rows.push(cells);
      }
      continue;
    }

    if (table && trimmed === "") {
      table = flushTable(table);
    }

    const ul = ulItem(trimmed);
    const ol = olItem(trimmed);
    if (ul !== null) {
      flush();
      if (!list || list.kind !== "ul") {
        table = flushTable(table);
        list = flushList(list);
        list = { kind: "ul", items: [] };
      }
      list.items.push(ul);
      continue;
    }
    if (ol !== null) {
      flush();
      if (!list || list.kind !== "ol") {
        table = flushTable(table);
        list = flushList(list);
        list = { kind: "ol", items: [] };
      }
      list.items.push(ol);
      continue;
    }

    if (list && trimmed === "") {
      list = flushList(list);
    }

    if (trimmed === "") {
      flush();
    } else {
      flushTable(table);
      table = null;
      list = flushList(list);
      list = null;
      buf.push(line);
    }
  }
  flush();
  if (table) flushTable(table);
  if (list) flushList(list);
  return blocks;
}

export type ArticleModule = {
  articleRu: Article;
  articleEn: Article;
};

export function getArticleFromModule(
  m: ArticleModule,
  lang: Language,
): Article {
  return lang === "en" ? m.articleEn : m.articleRu;
}