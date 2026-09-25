import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { Flag, HackathonPhase, ProjectStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS: Record<ProjectStatus, { label: string; bg: string; live?: boolean }> = {
  queued: { label: "In queue", bg: "var(--muted-surface)", live: true },
  running: { label: "Jury deliberating", bg: "var(--sky)", live: true },
  completed: { label: "Judged", bg: "var(--mint)" },
  partial: { label: "Partially judged", bg: "var(--yellow)" },
  failed: { label: "Evaluation failed", bg: "var(--coral)" },
  legacy: { label: "Old evaluation", bg: "var(--muted-surface)" },
};

export function StatusPill({ status, className }: { status: ProjectStatus; className?: string }) {
  const s = STATUS[status] ?? STATUS.queued;
  return (
    <span className={cn("chip", className)} style={{ background: s.bg }}>
      {s.live && <span className="size-1.5 rounded-full bg-ink animate-pulse-dot" aria-hidden />}
      {s.label}
    </span>
  );
}

const PHASE: Record<HackathonPhase, { label: string; bg: string }> = {
  upcoming: { label: "Upcoming", bg: "var(--sky)" },
  open: { label: "Open for submissions", bg: "var(--mint)" },
  closed: { label: "Submissions closed", bg: "var(--muted-surface)" },
  judging: { label: "Deadline passed", bg: "var(--violet)" },
};

export function PhaseBadge({ phase, short = false }: { phase: HackathonPhase; short?: boolean }) {
  const p = PHASE[phase] ?? PHASE.closed;
  return (
    <span className="chip" style={{ background: p.bg }}>
      {phase === "open" && <span className="size-1.5 rounded-full bg-ink animate-pulse-dot" aria-hidden />}
      {short ? p.label.split(" ")[0] : p.label}
    </span>
  );
}

const FLAG_STYLE = {
  error: { icon: AlertOctagon, bg: "color-mix(in srgb, var(--coral) 35%, var(--card))", label: "Issue" },
  warning: { icon: AlertTriangle, bg: "color-mix(in srgb, var(--yellow) 45%, var(--card))", label: "Warning" },
  info: { icon: Info, bg: "color-mix(in srgb, var(--sky) 35%, var(--card))", label: "Note" },
} as const;

export function FlagList({ flags }: { flags: Flag[] }) {
  if (!flags.length) return null;
  return (
    <ul className="space-y-2" aria-label="Integrity flags">
      {flags.map((f, i) => {
        const s = FLAG_STYLE[f.level] ?? FLAG_STYLE.info;
        const Icon = s.icon;
        return (
          <li key={`${f.code}-${i}`} className="flex gap-3 items-start rounded-lg border-2 border-ink px-3 py-2.5 text-sm" style={{ background: s.bg }}>
            <Icon size={18} className="shrink-0 mt-0.5" aria-hidden />
            <span>
              <span className="sr-only">{s.label}: </span>
              {f.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function FlagCount({ flags }: { flags: Flag[] }) {
  const serious = flags.filter((f) => f.level !== "info");
  if (!serious.length) return null;
  const hasError = serious.some((f) => f.level === "error");
  return (
    <span
      className="chip"
      style={{ background: hasError ? "var(--coral)" : "var(--yellow)" }}
      title={serious.map((f) => f.message).join("\n")}
    >
      <AlertTriangle size={12} aria-hidden />
      {serious.length} flag{serious.length > 1 ? "s" : ""}
    </span>
  );
}
