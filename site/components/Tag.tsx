"use client";

type Props = {
  label: string;
  size?: "sm" | "md";
};

export function Tag({ label, size = "sm" }: Props) {
  const sizes = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-ink-200 bg-paper-deep font-semibold text-ink-700",
        sizes,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
