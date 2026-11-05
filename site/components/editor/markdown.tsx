"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import "highlight.js/styles/github-dark.css";

/*
 * The book is written in markup GitHub understands, and the portal draws more of it:
 * call-outs `> [!TIP]`, folded <details>, heading anchors, highlighted code, and
 * adjacent code blocks titled `title="Команды"` / `title="Шорткат"` as tabs.
 */

type Node = { type: string; value?: string; meta?: string | null; children?: Node[]; data?: Record<string, unknown> };

const CALLOUTS: Record<string, string> = {
  NOTE: "Обратите внимание",
  TIP: "Подсказка",
  IMPORTANT: "Подумайте сами",
  WARNING: "Осторожно",
  CAUTION: "Осторожно",
};

function remarkCallouts() {
  return (tree: Node) => {
    visit(tree as never, "blockquote", (node: Node) => {
      const first = node.children?.[0];
      const text = first?.type === "paragraph" ? first.children?.[0] : undefined;
      const kind = text?.type === "text" ? text.value?.match(/^\[!(\w+)\]\s*/) : null;

      if (!text || !kind || !CALLOUTS[kind[1]]) return;
      text.value = text.value!.slice(kind[0].length);
      node.data = { hProperties: { className: ["callout", `callout-${kind[1].toLowerCase()}`] } };
      node.children!.unshift({ type: "paragraph", data: { hProperties: { className: ["callout-title"] } }, children: [{ type: "text", value: CALLOUTS[kind[1]] }] });
    });
  };
}

const titleOf = (node: Node) => (node.type === "code" ? node.meta?.match(/title="([^"]+)"/)?.[1] : undefined);

function remarkTabs() {
  return (tree: Node) => {
    visit(tree as never, (parent: Node) => {
      const children = parent.children;

      if (!children) return;
      for (let i = 0; i < children.length; i += 1) {
        let end = i;

        while (end < children.length && titleOf(children[end])) end += 1;
        if (end - i < 2) continue;
        const panels = children.slice(i, end).map((code) => ({ type: "tabPanel", data: { hName: "div", hProperties: { dataTitle: titleOf(code) } }, children: [code] }));

        children.splice(i, end - i, { type: "tabs", data: { hName: "div", hProperties: { className: ["code-tabs"] } }, children: panels });
      }
    });
  };
}

const schema = {
  ...defaultSchema,
  clobberPrefix: "",
  clobber: [],
  tagNames: [...(defaultSchema.tagNames ?? []), "details", "summary"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    div: [...(defaultSchema.attributes?.div ?? []), "dataTitle"],
    details: ["open", "id"],
  },
};

export const remarkPlugins = [remarkGfm, remarkCallouts, remarkTabs];
export const rehypePlugins = [rehypeRaw, [rehypeSanitize, schema], rehypeSlug, [rehypeHighlight, { aliases: { typescript: ["tsx", "ts"] } }]] as never[];

function Tabs({ children }: { children?: ReactNode }) {
  const panels = Children.toArray(children).filter(isValidElement) as ReactElement<{ "data-title"?: string; children?: ReactNode }>[];
  const [active, setActive] = useState(0);

  return (
    <div className="my-4 overflow-hidden rounded border border-stone-300">
      <div role="tablist" className="not-prose flex border-b border-stone-300 bg-stone-100">
        {panels.map((panel, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 text-sm ${i === active ? "bg-white font-medium text-stone-900" : "text-stone-600"}`}
          >
            {panel.props["data-title"]}
          </button>
        ))}
      </div>
      <div className="[&_pre]:my-0 [&_pre]:rounded-none">{panels[active]?.props.children}</div>
    </div>
  );
}

export function Div({ className, children, ...props }: { className?: string; children?: ReactNode; "data-title"?: string }) {
  if (className?.includes("code-tabs")) return <Tabs>{children}</Tabs>;
  return <div className={className} {...props}>{children}</div>;
}

/*
 * The portal routes by the hash, so an in-page anchor would leave the chapter: scroll
 * to it instead and unfold the hint it names. A link to a chapter of the book opens it.
 */
export function followLink(event: React.MouseEvent<HTMLElement>) {
  const link = (event.target as HTMLElement).closest("a");
  const href = link?.getAttribute("href");

  if (!href) return;
  const chapter = href.match(/(?:^|\/)chapters\/([\w-]+)\.md(?:#(.*))?$/);
  const lesson = href.match(/(?:^|\/)practice\/([\w-]+)\/README\.md(?:#(.*))?$/);

  if (chapter || lesson) {
    event.preventDefault();
    const [, slug, anchor] = (chapter ?? lesson)!;

    if (anchor) sessionStorage.setItem("anchor", anchor);
    window.location.hash = lesson ? `${slug}/practice` : slug;
    return;
  }
  if (href.startsWith("#")) {
    event.preventDefault();
    showAnchor(href.slice(1));
  }
}

export function showAnchor(anchor: string) {
  const target = document.getElementById(decodeURIComponent(anchor));

  if (!target) return false;
  for (let node: HTMLElement | null = target; node; node = node.parentElement) {
    if (node instanceof HTMLDetailsElement) node.open = true;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
