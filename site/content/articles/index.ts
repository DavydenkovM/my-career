import type { Language } from "@/content/i18n";
import type { Program } from "@/content/site";
import type { Article } from "./types";
import { articleRu as mobileRu, articleEn as mobileEn } from "./mobile-landscape-2026";
import {
  articleRu as fsdRu,
  articleEn as fsdEn,
} from "./feature-sliced-design-real-life";
import {
  articleRu as moduleRu,
  articleEn as moduleEn,
} from "./mobile-core-module";
// import {
//   articleRu as coreRu,
//   articleEn as coreEn,
// } from "./mobile-core-requirements";

const articlesByLang: Record<Language, Article[]> = {
  ru: [moduleRu, fsdRu, mobileRu],
  en: [moduleEn, fsdEn, mobileEn],
};

export const articlesBySlug: Record<string, Record<Language, Article>> = Object.fromEntries(
  articlesByLang.ru.map((a) => [a.slug, { ru: a, en: articlesByLang.en.find((x) => x.slug === a.slug)! }]),
);

export function getArticleBySlug(slug: string, lang: Language): Article | undefined {
  return articlesBySlug[slug]?.[lang];
}

export function getArticlePrograms(lang: Language): Program[] {
  return articlesByLang[lang].map((a) => ({
    title: a.title,
    description: a.lead,
    href: `/programs/${a.slug}`,
    tags: a.tags,
    date: a.date,
  }));
}