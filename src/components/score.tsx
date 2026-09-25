"use client";

import { motion } from "motion/react";
import { JUDGES, type JudgeKey } from "@/lib/api";
import { JUDGE_COLORS } from "@/lib/constants";
import { cn, formatScore, scoreColor, scoreLabel } from "@/lib/utils";
import { CountUp, easeOut } from "./motion";

/** Big circular score gauge (0..10) with an animated sweep and count-up. */
export function ScoreDial({
  score,
  size = 168,
  stroke = 14,
  caption = true,
}: {
  score: number | null | undefined;
  size?: number;
  stroke?: number;
  caption?: boolean;
}) {
  const r = (size - stroke) / 2 - 4;
  const c = 2 * Math.PI * r;
  const value = score ?? 0;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex flex-col items-center" role="img" aria-label={`Final score ${formatScore(score)} out of 10`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="var(--card)" stroke="var(--ink)" strokeWidth={stroke + 4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted-surface)" strokeWidth={stroke} />
        {score !== null && score !== undefined && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - value / 10) }}
            transition={{ duration: 1.2, ease: easeOut, delay: 0.15 }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ height: size }}>
        <span className="num font-bold leading-none" style={{ fontSize: size * 0.27 }}>
          {score === null || score === undefined ? "—" : <CountUp value={value} decimals={1} />}
        </span>
        <span className="num text-xs text-muted-foreground mt-1">/ 10</span>
      </div>
      {caption && (
        <span className="chip mt-3" style={{ background: color }}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  );
}

/** Horizontal bar for a 0..10 score. */
export function ScoreBar({
  score,
  color,
  className,
  height = 12,
}: {
  score: number | null | undefined;
  color?: string;
  className?: string;
  height?: number;
}) {
  const pct = score === null || score === undefined ? 0 : Math.max(2, (score / 10) * 100);
  return (
    <div
      className={cn("w-full rounded-full border-2 border-ink bg-muted overflow-hidden", className)}
      style={{ height }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={score ?? undefined}
      aria-label="Score"
    >
      <motion.div
        className="h-full border-r-2 border-ink"
        style={{ background: color ?? scoreColor(score) }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: easeOut }}
      />
    </div>
  );
}

export function ScorePill({ score, className }: { score: number | null | undefined; className?: string }) {
  return (
    <span className={cn("chip num font-bold", className)} style={{ background: scoreColor(score) }}>
      {formatScore(score)}
      <span className="font-medium opacity-70">/10</span>
    </span>
  );
}

/** Three compact judge scores, e.g. on cards and leaderboard rows. */
export function JudgeScores({
  scores,
  compact = false,
}: {
  scores: Partial<Record<JudgeKey, number | null>>;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-1.5", compact ? "grid-cols-3" : "grid-cols-1")}>
      {JUDGES.map((j) => {
        const s = scores?.[j.key];
        return (
          <div key={j.key} className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block size-2.5 rounded-full border-[1.5px] border-ink shrink-0"
              style={{ background: JUDGE_COLORS[j.key] }}
              aria-hidden
            />
            <span className="text-xs font-semibold truncate">{j.short}</span>
            <span className="num text-xs ml-auto">{formatScore(s)}</span>
          </div>
        );
      })}
    </div>
  );
}
