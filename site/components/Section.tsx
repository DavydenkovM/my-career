import type { ReactNode } from "react";

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 first:mt-0 sm:mt-16">
      <h2 className="h-section mb-5 flex items-center gap-4">
        <span>{title}</span>
        <span className="h-px flex-1 bg-ink-200" />
      </h2>
      {children}
    </section>
  );
}
