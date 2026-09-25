"use client";

import { motion } from "motion/react";
import { Check, CircleDashed, GitBranch, Gavel, LineChart, Loader2, Sparkles, X, Code2, MinusCircle } from "lucide-react";
import type { PipelineStage, Project, StageKey } from "@/lib/api";
import { JUDGE_COLORS } from "@/lib/constants";

const STAGES: { key: StageKey; label: string; detail: string; icon: typeof Check; color: string }[] = [
  { key: "ingest", label: "Ingest repo", detail: "Clone, measure & index the code", icon: GitBranch, color: "var(--yellow)" },
  { key: "code", label: "Code Judge", detail: "Reviews the source with RAG", icon: Code2, color: JUDGE_COLORS.code },
  { key: "market", label: "Market Judge", detail: "Researches the market live", icon: LineChart, color: JUDGE_COLORS.market },
  { key: "product", label: "Product Judge", detail: "Verifies claims & originality", icon: Sparkles, color: JUDGE_COLORS.product },
  { key: "verdict", label: "Head Judge", detail: "Weights, flags & ranks", icon: Gavel, color: "var(--coral)" },
];

function StageIcon({ stage }: { stage?: PipelineStage }) {
  switch (stage?.status) {
    case "running":
      return <Loader2 size={16} className="animate-spin-slow" aria-hidden />;
    case "done":
      return <Check size={16} strokeWidth={3} aria-hidden />;
    case "partial":
      return <MinusCircle size={16} aria-hidden />;
    case "failed":
      return <X size={16} strokeWidth={3} aria-hidden />;
    default:
      return <CircleDashed size={16} aria-hidden />;
  }
}

export function PipelineTracker({ project }: { project: Project }) {
  const pipeline = project.pipeline ?? {};
  const doneCount = STAGES.filter((s) => ["done", "partial", "failed"].includes(pipeline[s.key]?.status ?? "")).length;

  return (
    <section className="brutal-card p-5" aria-live="polite" aria-label="Evaluation progress">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="eyebrow">Live deliberation</p>
          <h2 className="text-lg font-bold">
            {project.status === "queued"
              ? project.queue_position
                ? `Waiting in queue · position ${project.queue_position}`
                : "Waiting for a free judge…"
              : "The jury is reviewing this project"}
          </h2>
        </div>
        <span className="num text-sm font-bold">{doneCount}/{STAGES.length}</span>
      </div>

      <div className="h-2.5 rounded-full border-2 border-ink bg-muted overflow-hidden mb-5">
        <motion.div
          className="h-full bg-ink"
          animate={{ width: `${Math.max(4, (doneCount / STAGES.length) * 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {STAGES.map((s, i) => {
          const stage = pipeline[s.key];
          const running = stage?.status === "running";
          const Icon = s.icon;
          return (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative rounded-lg border-2 border-ink p-3 overflow-hidden"
              style={{
                background: stage?.status && stage.status !== "pending" ? s.color : "var(--card)",
                opacity: stage?.status === "pending" || !stage ? 0.7 : 1,
              }}
            >
              {running && (
                <motion.span
                  className="absolute inset-0 bg-white/40"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                />
              )}
              <div className="relative flex items-center justify-between mb-1">
                <Icon size={16} aria-hidden />
                <StageIcon stage={stage} />
              </div>
              <p className="relative text-sm font-bold leading-tight">{s.label}</p>
              <p className="relative text-xs leading-snug mt-0.5 opacity-80">
                {stage?.message ?? s.detail}
              </p>
              <span className="sr-only">Status: {stage?.status ?? "pending"}</span>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
