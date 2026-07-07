import { useLang } from "./LangProvider";

type Period = { from: string; to?: string; present?: boolean };

function year(ym: string | undefined): number | null {
  if (!ym) return null;
  const m = /^(\d{4})/.exec(ym);
  return m ? Number(m[1]) : null;
}

/** "2023 — н.в." / "2014 — 2018" — year-only range for the sidebar / tabs. */
export function YearRange({ period }: { period: Period }) {
  const { t, lang } = useLang();
  const fromYear = year(period.from);
  const toYear = period.present ? null : year(period.to);
  const presentLabel = lang === "en" ? "present" : "н.в.";
  if (!fromYear && !toYear) return null;
  if (period.present) {
    return (
      <span className="font-mono text-xs tabular-nums text-ink-500">
        {fromYear} — {presentLabel}
      </span>
    );
  }
  if (fromYear && toYear) {
    return (
      <span className="font-mono text-xs tabular-nums text-ink-500">
        {fromYear} — {toYear}
      </span>
    );
  }
  return (
    <span className="font-mono text-xs tabular-nums text-ink-500">
      {fromYear ?? toYear}
    </span>
  );
}
