import { notFound } from "next/navigation";
import { ArticleClient } from "@/components/ArticleClient";
import { articlesBySlug } from "@/content/articles/mobile-landscape-2026";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(articlesBySlug).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articlesBySlug[params.slug];
  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — Михаил Давыденков`,
    description: article.lead,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  if (!articlesBySlug[params.slug]) notFound();
  return <ArticleClient slug={params.slug} />;
}
