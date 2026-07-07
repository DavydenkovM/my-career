"use client";

import { useLang } from "./LangProvider";
import { getSiteContent } from "@/content/site";
import { LangSwitcher } from "./LangSwitcher";
import { PrintButton } from "./PrintButton";

function LinkedInIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.01-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function AiIcon() {
  return (
    <span
      aria-hidden="true"
      className="font-mono text-[10px] font-bold leading-none tracking-tight text-current"
    >
      AI
    </span>
  );
}

function getProfileIcon(label: string) {
  switch (label) {
    case "LinkedIn":
      return LinkedInIcon;
    case "GitHub":
      return GitHubIcon;
    case "AI":
      return AiIcon;
    default:
      return GlobeIcon;
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
        {label}
      </span>
      <span className="text-sm text-ink-900">{value}</span>
    </div>
  );
}

export function Header() {
  const { lang, t } = useLang();
  const { meta } = getSiteContent(lang);

  const ageAndFamily =
    typeof meta.age === "number" && meta.family
      ? `${meta.age} · ${meta.family}`
      : typeof meta.age === "number"
        ? `${meta.age}`
        : (meta.family ?? null);

  return (
    <header className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-12 lg:gap-14">
      {/* Row 1: [photo + controls] | [name + roles] */}
      <div className="flex shrink-0 flex-col items-start gap-2 sm:gap-3">
        {meta.photo ? (
          <img
            src={meta.photo}
            alt={meta.name}
            width={128}
            height={128}
            className="h-20 w-20 rounded-xl border-2 border-ink-200 object-cover shadow-sm sm:h-32 sm:w-32 sm:rounded-2xl"
          />
        ) : null}
        <div className="no-print flex flex-col items-stretch gap-1.5">
          <div className="flex flex-row items-center gap-1.5">
            <LangSwitcher />
            <PrintButton compact />
          </div>
          {meta.profileButtons && meta.profileButtons.length > 0 ? (
            <div className="flex flex-row items-center gap-1.5">
              {meta.profileButtons.map((b) => {
                const Icon = getProfileIcon(b.label);
                return (
                  <a
                    key={b.label}
                    href={b.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={b.label}
                    title={b.label}
                    className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-ink-200 bg-white text-ink-700 shadow-sm transition hover:border-accent hover:text-accent"
                  >
                    {Icon ? <Icon /> : null}
                  </a>
                );
              })}
            </div>
          ) : null}        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="h-name text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
          {meta.name}
        </h1>
        {meta.roles && meta.roles.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded-md border border-ink-200 bg-paper-deep px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink-800"
              >
                {r}
              </span>
            ))}
          </div>
        ) : null}

        {/* Row 2: personal data */}
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:mt-5 sm:grid-cols-2 sm:gap-y-3">
          {meta.education && meta.education.length > 0 ? (
            <InfoRow
              label={t("ui.education")}
              value={
                <span className="text-[0.8rem] leading-snug text-ink-700">
                  {meta.education.join(" · ")}
                </span>
              }
            />
          ) : null}
          {ageAndFamily ? (
            <InfoRow label={t("ui.family")} value={ageAndFamily} />
          ) : null}
        </dl>

        {meta.contactLinks && meta.contactLinks.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1 sm:mt-4 sm:max-w-xs">
            {meta.contactLinks.map((c) => {
              const inner = (
                <span className="flex items-baseline gap-2">
                  <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-accent sm:w-20">
                    {c.label}
                  </span>
                  <span className="truncate text-xs text-ink-900 sm:text-sm">{c.value}</span>
                </span>
              );
              return (
                <li key={c.label} className="leading-tight">
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer noopener"
                      className="link"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </header>
  );
}
