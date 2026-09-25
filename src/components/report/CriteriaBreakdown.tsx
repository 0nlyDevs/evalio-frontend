"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, FileCode2 } from "lucide-react";
import type { CriterionScore } from "@/lib/api";
import { JUDGE_COLORS } from "@/lib/constants";
import { formatScore } from "@/lib/utils";
import { ScoreBar } from "../score";

const JUDGE_NAME = { code: "Code Judge", market: "Market Judge", product: "Product Judge" } as const;

export function CriteriaBreakdown({ criteria, repoUrl }: { criteria: CriterionScore[]; repoUrl?: string }) {
  const [open, setOpen] = useState<string | null>(criteria[0]?.name ?? null);
  const total = criteria.reduce((s, c) => s + (c.weight || 0), 0) || 1;

  return (
    <ul className="space-y-3">
      {criteria.map((c) => {
        const isOpen = open === c.name;
        const panelId = `crit-${c.name.replace(/\W+/g, "-")}`;
        return (
          <li key={c.name} className="brutal-card overflow-hidden">
            <button
              className="w-full text-left p-4 flex flex-col gap-2.5 hover:bg-muted/60 transition-colors"
              onClick={() => setOpen(isOpen ? null : c.name)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">{c.name}</span>
                <span className="chip text-[11px]" style={{ background: JUDGE_COLORS[c.judge] }}>{JUDGE_NAME[c.judge]}</span>
                <span className="num text-xs text-muted-foreground">weight {Math.round((c.weight / total) * 100)}%</span>
                {c.status === "heuristic" && <span className="chip text-[11px] bg-muted">measured signals</span>}
                {c.status === "no_code" && <span className="chip text-[11px] bg-coral">no code</span>}
                <span className="ml-auto num font-bold text-lg">{formatScore(c.score)}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} aria-hidden>
                  <ChevronDown size={18} />
                </motion.span>
              </div>
              <ScoreBar score={c.score} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 border-t-2 border-dashed border-ink/30 space-y-3 text-sm">
                    {c.rationale && <p className="leading-relaxed">{c.rationale}</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Points title="Strengths" items={c.strengths} tone="var(--mint)" />
                      <Points title="Weaknesses" items={c.weaknesses} tone="var(--coral)" />
                    </div>
                    <EvidenceList evidence={c.evidence} repoUrl={repoUrl} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function Points({ title, items, tone }: { title: string; items?: string[]; tone: string }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-lg border-2 border-ink p-3" style={{ background: `color-mix(in srgb, ${tone} 22%, var(--card))` }}>
      <p className="eyebrow !text-ink mb-1.5">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <span className="mt-1.5 size-1.5 rounded-full bg-ink shrink-0" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidenceList({ evidence, repoUrl }: { evidence?: { file?: string; note?: string }[]; repoUrl?: string }) {
  const items = (evidence ?? []).filter((e) => e.file || e.note);
  if (!items.length) return null;
  return (
    <div>
      <p className="eyebrow mb-1.5">Evidence</p>
      <ul className="space-y-1.5">
        {items.map((e, i) => {
          const looksLikePath = !!e.file && /[./]/.test(e.file) && !/\s/.test(e.file);
          return (
            <li key={i} className="flex gap-2 items-start text-sm">
              <FileCode2 size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span className="min-w-0">
                {e.file &&
                  (looksLikePath && repoUrl ? (
                    <a href={`${repoUrl}/blob/HEAD/${e.file.replace(/^\/+/, "")}`} target="_blank" rel="noreferrer" className="num text-xs font-semibold underline decoration-2 underline-offset-2 break-all">
                      {e.file}
                    </a>
                  ) : (
                    <span className="num text-xs font-semibold break-all">{e.file}</span>
                  ))}
                {e.note && <span className="text-muted-foreground"> — {e.note}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Renders "[3]" style citations as links to the numbered sources. */
export function Cited({ text, sources }: { text?: string; sources?: { id: number; url: string; title: string }[] }) {
  if (!text) return null;
  const byId = new Map((sources ?? []).map((s) => [s.id, s]));
  return (
    <>
      {text.split(/(\[\d+\])/g).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        const src = m ? byId.get(Number(m[1])) : undefined;
        if (!src) return <span key={i}>{part}</span>;
        return (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noreferrer"
            title={src.title}
            className="num text-[0.7em] align-super font-bold px-1 mx-0.5 rounded border border-ink bg-yellow hover:bg-ink hover:text-yellow transition-colors"
          >
            {m![1]}
          </a>
        );
      })}
    </>
  );
}
