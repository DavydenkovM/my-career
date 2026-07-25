import { notFound } from "next/navigation";
import { ArticleClient } from "@/components/ArticleClient";
import { articlesBySlug, getArticleBySlug } from "@/content/articles";
import { defaultLanguage } from "@/content/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(articlesBySlug).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug, defaultLanguage);
  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — Mikhail Davydenkov`,
    description: article.lead,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const articles = articlesBySlug[params.slug];
  if (!articles) notFound();
  return <ArticleClient articles={articles} />;
}