import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Traffic-light color for a 0..10 score. */
export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "var(--muted-surface)";
  if (score >= 7.5) return "var(--mint)";
  if (score >= 5.5) return "var(--yellow)";
  if (score >= 3.5) return "var(--orange)";
  return "var(--coral)";
}

export function scoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "Not scored";
  if (score >= 8.5) return "Outstanding";
  if (score >= 7.5) return "Strong";
  if (score >= 5.5) return "Solid";
  if (score >= 3.5) return "Needs work";
  return "Weak";
}

export function formatScore(score: number | null | undefined, digits = 1): string {
  return score === null || score === undefined ? "—" : score.toFixed(digits);
}

export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function timeAgo(value?: string | null): string {
  if (!value) return "";
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [31557600, "year"], [2629800, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"],
  ];
  const [size, name] = units.find(([s]) => seconds >= s)!;
  const n = Math.floor(seconds / size);
  return `${n} ${name}${n > 1 ? "s" : ""} ago`;
}

export function timeUntil(value?: string | null): string {
  if (!value) return "";
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return "ended";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return `${Math.max(1, Math.floor(ms / 60_000))} min left`;
  if (hours < 48) return `${hours} h left`;
  return `${Math.floor(hours / 24)} days left`;
}

export function repoLabel(url?: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\.git$/, "");
}
