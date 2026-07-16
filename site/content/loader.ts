import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Language } from "./i18n";
import { asset } from "./asset";

export type ExperienceFrontmatter = {
  company: string;
  role: string;
  period: { from: string; to?: string; present?: boolean };
  location?: string;
  order?: number;
  source?: string;
  aboutShort?: string;
  aboutTags?: string[];
  highlights?: string[];
  media?: MediaItem[];
  /** Recommendation letter, performance review, or other document. */
  attachments?: AttachmentItem[];
};

export type MediaItem = {
  src: string;
  /** image | video */
  type?: "image" | "video";
  /** Required for videos; for images, used as a poster. */
  poster?: string;
  /** Short caption shown under the thumbnail and in the modal. */
  caption?: string;
  /** Optional alt / title for the asset. */
  alt?: string;
};

export type AttachmentItem = {
  /** URL to the attached document (PDF, etc.). */
  href: string;
  /** Inline preview image shown next to the attachment. */
  preview?: string;
  /** Title rendered above the link. */
  title: string;
  /** Optional subtitle (issuer / year / etc.). */
  subtitle?: string;
  /** Optional caption / description text. */
  description?: string;
  /** Optional file size label (e.g. "577 KB"). */
  size?: string;
};

export type Experience = ExperienceFrontmatter & {
  slug: string;
  lang: Language;
  body: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "experience");

function readDirSafe(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

export function getExperience(lang: Language): Experience[] {
  const dir = path.join(CONTENT_ROOT, lang);
  const files = readDirSafe(dir);
  const items: Experience[] = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Partial<ExperienceFrontmatter>;
    return {
      slug,
      lang,
      body: parsed.content,
      company: fm.company ?? slug,
      role: fm.role ?? "",
      period: fm.period ?? { from: "" },
      location: fm.location,
      order: fm.order ?? 100,
      source: fm.source,
      aboutShort: fm.aboutShort,
      aboutTags: fm.aboutTags,
      highlights: fm.highlights,
      media: fm.media?.map((m) => ({
        ...m,
        src: asset(m.src),
        poster: m.poster ? asset(m.poster) : undefined,
      })),
      attachments: fm.attachments?.map((a) => ({
        ...a,
        href: asset(a.href),
        preview: a.preview ? asset(a.preview) : undefined,
      })),
    };
  });
  return items.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export function getExperienceSlugs(): string[] {
  const ru = readDirSafe(path.join(CONTENT_ROOT, "ru")).map((f) => f.replace(/\.md$/, ""));
  const en = readDirSafe(path.join(CONTENT_ROOT, "en")).map((f) => f.replace(/\.md$/, ""));
  return Array.from(new Set([...ru, ...en]));
}
