"use client";

import Link from "next/link";
import { LayoutGroup, motion } from "motion/react";
import { Crown, Medal } from "lucide-react";
import { isEvaluating, JUDGES, type Criterion, type Project } from "@/lib/api";
import { JUDGE_COLORS } from "@/lib/constants";
import { formatScore, scoreColor } from "@/lib/utils";
import { ScorePill } from "./score";
import { FlagCount, StatusPill } from "./status";

const PODIUM = [
  { place: 2, height: "h-28", color: "var(--sky)", delay: 0.15 },
  { place: 1, height: "h-40", color: "var(--yellow)", delay: 0 },
  { place: 3, height: "h-20", color: "var(--coral)", delay: 0.3 },
];

export function Podium({ projects }: { projects: Project[] }) {
  const ranked = projects.filter((p) => p.overall_score !== null).slice(0, 3);
  if (ranked.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-3xl mx-auto" aria-label="Top 3">
      {PODIUM.map(({ place, height, color, delay }) => {
        const p = ranked[place - 1];
        if (!p) return <div key={place} />;
        return (
          <motion.div
            key={p.project_id}
            className="flex flex-col items-center text-center min-w-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 + delay }}
          >
            <Link href={`/project/${p.project_id}`} className="group flex flex-col items-center min-w-0 w-full mb-3">
              {place === 1 ? (
                <motion.span animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <Crown size={30} className="text-ink fill-yellow" aria-hidden />
                </motion.span>
              ) : (
                <Medal size={24} aria-hidden className="fill-card" />
              )}
              <span className="font-bold text-sm sm:text-base mt-1 truncate max-w-full group-hover:underline">{p.name}</span>
              <span className="num text-xl sm:text-2xl font-bold">{formatScore(p.overall_score)}</span>
            </Link>
            <motion.div
              className={`w-full ${height} rounded-t-xl border-2 border-ink border-b-0 flex items-start justify-center pt-3 shadow-[var(--shadow-hard)] origin-bottom`}
              style={{ background: color }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18, delay }}
            >
              <span className="num text-3xl sm:text-4xl font-bold">{place}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function LeaderboardTable({ projects, criteria }: { projects: Project[]; criteria: Criterion[] }) {
  return (
    <div className="brutal-card overflow-hidden">
      <div className="hidden md:grid grid-cols-[56px_minmax(0,2.2fr)_repeat(3,minmax(0,0.8fr))_minmax(0,1fr)_110px] gap-3 px-4 py-3 bg-ink text-paper text-xs font-bold uppercase tracking-wide">
        <span>Rank</span>
        <span>Project</span>
        {JUDGES.map((j) => (
          <span key={j.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: JUDGE_COLORS[j.key] }} aria-hidden />
            {j.short}
          </span>
        ))}
        <span>Criteria</span>
        <span className="text-right">Final</span>
      </div>
      <LayoutGroup>
        <ol>
          {projects.map((p, i) => (
            <motion.li
              key={p.project_id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 300, damping: 30 }}
              className="border-t-2 border-ink first:border-t-0 md:first:border-t-0"
            >
              <Link
                href={`/project/${p.project_id}`}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto] md:grid-cols-[56px_minmax(0,2.2fr)_repeat(3,minmax(0,0.8fr))_minmax(0,1fr)_110px] gap-3 items-center px-4 py-3.5 hover:bg-yellow/25 transition-colors"
              >
                <RankBadge rank={p.rank} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold truncate">{p.name}</span>
                    <FlagCount flags={p.flags ?? []} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{p.headline || p.short_description}</p>
                  {isEvaluating(p) || p.overall_score === null ? <StatusPill status={p.status} className="mt-1" /> : null}
                </div>
                {JUDGES.map((j) => (
                  <span key={j.key} className="hidden md:block num text-sm">{formatScore(p.judge_scores?.[j.key])}</span>
                ))}
                <CriteriaSpark project={p} criteria={criteria} />
                <div className="flex justify-end">
                  <ScorePill score={p.overall_score} className="text-sm" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ol>
      </LayoutGroup>
    </div>
  );
}

function RankBadge({ rank }: { rank?: number | null }) {
  const bg = rank === 1 ? "var(--yellow)" : rank === 2 ? "var(--sky)" : rank === 3 ? "var(--coral)" : "var(--card)";
  return (
    <span
      className="num size-9 rounded-lg border-2 border-ink flex items-center justify-center font-bold text-sm shadow-[var(--shadow-hard-sm)]"
      style={{ background: bg }}
      aria-label={rank ? `Rank ${rank}` : "Not ranked yet"}
    >
      {rank ?? "–"}
    </span>
  );
}

/** Tiny bar per criterion so organisers see the profile of each project at a glance. */
function CriteriaSpark({ project, criteria }: { project: Project; criteria: Criterion[] }) {
  const scores = new Map(project.criteria_scores.map((c) => [c.name, c.score]));
  if (!project.criteria_scores.length) return <span className="hidden md:block text-xs text-muted-foreground">—</span>;
  return (
    <div className="hidden md:flex items-end gap-1 h-8" aria-hidden>
      {criteria.map((c) => {
        const s = scores.get(c.name);
        return (
          <span
            key={c.name}
            title={`${c.name}: ${formatScore(s)}`}
            className="flex-1 max-w-4 rounded-sm border-[1.5px] border-ink"
            style={{ height: `${Math.max(12, ((s ?? 0) / 10) * 100)}%`, background: scoreColor(s) }}
          />
        );
      })}
    </div>
  );
}
