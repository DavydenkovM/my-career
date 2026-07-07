import { useLang } from "./LangProvider";

type Period = { from: string; to?: string; present?: boolean };

function formatYM(ym: string, months: string[]): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  const monthIndex = Math.max(0, Math.min(11, Number(m[2]) - 1));
  return `${months[monthIndex]} ${m[1]}`;
}

export function formatPeriod(period: Period, months: string[], presentLabel: string): string {
  const from = period.from ? formatYM(period.from, months) : "";
  const to = period.present
    ? presentLabel
    : period.to
      ? formatYM(period.to, months)
      : "";
  if (from && to) return `${from} — ${to}`;
  return from || to || "";
}

export function Period({ period }: { period: Period }) {
  const { t, tArr } = useLang();
  const months = tArr("ui.monthsShort");
  return (
    <span className="font-mono text-xs text-ink-500">
      {formatPeriod(period, months, t("ui.present"))}
    </span>
  );
}
