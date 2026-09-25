"use client";

import { motion } from "motion/react";
import {
  AlertTriangle, CheckCircle2, CircleDashed, ExternalLink, GitCommit, Globe, Link2, Users, XCircle,
} from "lucide-react";
import type { CodeReport, MarketReport, ProductReport, RepoSnapshot } from "@/lib/api";
import { formatDate, formatScore, scoreColor } from "@/lib/utils";
import { ScoreBar } from "../score";
import { Cited, EvidenceList, Points } from "./CriteriaBreakdown";

const LANG_COLORS = ["var(--sky)", "var(--yellow)", "var(--mint)", "var(--coral)", "var(--violet)", "var(--pink)", "var(--orange)"];

function Block({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border-2 border-ink bg-card p-4 ${className}`}>
      <h3 className="eyebrow !text-ink mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border-2 border-ink bg-card px-3 py-2">
      <div className="num text-lg font-bold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Unavailable({ report, what }: { report?: { error?: string | null; summary?: string } | null; what: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-ink p-6 text-sm text-muted-foreground">
      {report?.summary || `The ${what} report is not available yet.`}
      {report?.error && <p className="mt-2 num text-xs break-words">{report.error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code
// ---------------------------------------------------------------------------

const SUBSCORE_LABELS: Record<string, string> = {
  testing: "Testing & CI",
  documentation: "Documentation",
  tooling: "Tooling",
  hygiene: "Repo hygiene",
};

export function CodePanel({ report, snapshot, repoUrl }: { report?: CodeReport | null; snapshot?: RepoSnapshot | null; repoUrl?: string }) {
  if (!report && !snapshot) return <Unavailable what="code" />;
  const history = snapshot?.history;
  const perDay = Object.entries(history?.commits_per_day ?? {}).slice(-30);
  const maxDay = Math.max(1, ...perDay.map(([, n]) => n));

  return (
    <div className="space-y-4">
      {report?.summary && <p className="text-base leading-relaxed">{report.summary}</p>}
      {report?.architecture && <p className="text-sm text-muted-foreground leading-relaxed">{report.architecture}</p>}

      {snapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metric label="Lines of code" value={snapshot.files.code_loc.toLocaleString("en-US")} />
          <Metric label="Source files" value={snapshot.files.code_files} />
          <Metric label={history?.truncated ? "Commits (latest)" : "Commits"} value={`${history?.commit_count ?? 0}${history?.truncated ? "+" : ""}`} />
          <Metric label="Contributors" value={history?.contributors.length ?? 0} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {report?.scorecard && (
          <Block title="Measured engineering signals">
            <div className="space-y-2.5">
              {Object.entries(report.scorecard.subscores).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{SUBSCORE_LABELS[k] ?? k}</span>
                    <span className="num">{formatScore(v)}</span>
                  </div>
                  <ScoreBar score={v} height={10} />
                </div>
              ))}
            </div>
          </Block>
        )}

        {snapshot && (
          <Block title="Stack & languages">
            <div className="flex h-5 rounded-md border-2 border-ink overflow-hidden mb-2" aria-label="Language breakdown">
              {snapshot.languages.slice(0, 7).map((l, i) => (
                <motion.span
                  key={l.name}
                  title={`${l.name} ${Math.round(l.share * 100)}%`}
                  className="h-full border-r-[1.5px] border-ink last:border-r-0"
                  style={{ background: LANG_COLORS[i % LANG_COLORS.length] }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${l.share * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-3">
              {snapshot.languages.slice(0, 7).map((l, i) => (
                <span key={l.name} className="flex items-center gap-1">
                  <span className="size-2 rounded-full border border-ink" style={{ background: LANG_COLORS[i % LANG_COLORS.length] }} aria-hidden />
                  {l.name} <span className="num text-muted-foreground">{Math.round(l.share * 100)}%</span>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {snapshot.stack.frameworks.map((f) => <span key={f.label} className="chip bg-sky">{f.label}</span>)}
              {snapshot.stack.libraries.map((l) => <span key={l} className="chip">{l}</span>)}
              {!snapshot.stack.frameworks.length && !snapshot.stack.libraries.length && <span className="text-sm text-muted-foreground">No framework detected.</span>}
            </div>
          </Block>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Points title="Strengths" items={report?.strengths} tone="var(--mint)" />
        <Points title="Weaknesses" items={report?.weaknesses} tone="var(--yellow)" />
        <Points title="Risks" items={report?.risks} tone="var(--coral)" />
      </div>

      {perDay.length > 1 && (
        <Block title="Commit activity">
          <div className="flex items-end gap-1 h-20" aria-label="Commits per day">
            {perDay.map(([day, n], i) => (
              <motion.span
                key={day}
                title={`${day}: ${n} commit${n > 1 ? "s" : ""}`}
                className="flex-1 rounded-t-sm border-[1.5px] border-ink bg-violet origin-bottom"
                style={{ height: `${(n / maxDay) * 100}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1 num">
            <span>{perDay[0][0]}</span>
            <span>{perDay[perDay.length - 1][0]}</span>
          </div>
          {history?.recent_commits && (
            <ul className="mt-3 space-y-1">
              {history.recent_commits.slice(0, 5).map((c) => (
                <li key={c.sha} className="flex gap-2 text-sm items-baseline min-w-0">
                  <GitCommit size={13} className="shrink-0 self-center" aria-hidden />
                  <span className="num text-xs text-muted-foreground shrink-0">{c.sha.slice(0, 7)}</span>
                  <span className="truncate">{c.subject}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-auto">{formatDate(c.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}

      <EvidenceList evidence={report?.evidence} repoUrl={repoUrl} />
      {report?.files_reviewed && report.files_reviewed.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">Files the judge read ({report.files_reviewed.length})</summary>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {report.files_reviewed.map((f) => (
              <li key={f}>
                <a href={repoUrl ? `${repoUrl}/blob/HEAD/${f}` : undefined} target="_blank" rel="noreferrer" className="chip num text-[11px] bg-muted hover:bg-sky">{f}</a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market
// ---------------------------------------------------------------------------

const SEVERITY: Record<string, string> = { high: "var(--coral)", medium: "var(--yellow)", low: "var(--mint)" };

export function MarketPanel({ report }: { report?: MarketReport | null }) {
  if (!report || report.status === "failed") return <Unavailable report={report} what="market" />;
  const sources = report.sources ?? [];

  return (
    <div className="space-y-4">
      {report.profile && (
        <div className="rounded-xl border-2 border-ink bg-mint/40 p-4">
          <p className="eyebrow !text-ink mb-1">{report.profile.category}</p>
          <p className="text-lg font-bold leading-snug">{report.profile.pitch}</p>
          {report.profile.problem && <p className="text-sm mt-1.5"><strong>Problem:</strong> {report.profile.problem}</p>}
        </div>
      )}

      <p className="text-base leading-relaxed"><Cited text={report.summary} sources={sources} /></p>

      {report.scores && (
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Market potential", report.scores.market_potential],
            ["Differentiation", report.scores.differentiation],
            ["Viability", report.scores.viability],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg border-2 border-ink p-3" style={{ background: `color-mix(in srgb, ${scoreColor(value as number)} 35%, var(--card))` }}>
              <div className="num text-2xl font-bold">{formatScore(value as number)}</div>
              <div className="text-xs font-semibold">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Market size & trend">
          <p className="text-sm leading-relaxed"><Cited text={report.market_size || "No reliable figure found."} sources={sources} /></p>
          {report.market_trend && <p className="text-sm leading-relaxed mt-2 text-muted-foreground"><Cited text={report.market_trend} sources={sources} /></p>}
          {report.problem_severity && <p className="text-sm leading-relaxed mt-2"><strong>Pain:</strong> <Cited text={report.problem_severity} sources={sources} /></p>}
        </Block>
        <Block title="Who it's for">
          {report.audience?.length ? (
            <ul className="space-y-2">
              {report.audience.map((a) => (
                <li key={a.name} className="flex gap-2 text-sm">
                  <Users size={15} className="shrink-0 mt-0.5" aria-hidden />
                  <span><strong>{a.name}</strong>{a.need && <span className="text-muted-foreground"> — {a.need}</span>}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Not identified.</p>}
        </Block>
      </div>

      {report.competitors && report.competitors.length > 0 && (
        <Block title={`Competitors found (${report.competitors.length})`}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-1 pb-2 font-semibold">Competitor</th>
                  <th className="px-1 pb-2 font-semibold">What they do</th>
                  <th className="px-1 pb-2 font-semibold">How this project differs</th>
                </tr>
              </thead>
              <tbody>
                {report.competitors.map((c) => (
                  <tr key={c.name} className="border-t-2 border-dashed border-ink/20 align-top">
                    <td className="px-1 py-2 font-bold whitespace-nowrap">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-2 underline-offset-2">
                          {c.name} <ExternalLink size={12} aria-hidden />
                        </a>
                      ) : c.name}
                    </td>
                    <td className="px-1 py-2">{c.description}</td>
                    <td className="px-1 py-2 text-muted-foreground">{c.differentiation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.differentiation && <p className="text-sm mt-3 pt-3 border-t-2 border-dashed border-ink/20"><strong>Edge:</strong> <Cited text={report.differentiation} sources={sources} /></p>}
        </Block>
      )}

      {report.business && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Block title="Business model">
            <p className="text-sm leading-relaxed">{report.business.business_model}</p>
            {report.business.revenue_streams?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {report.business.revenue_streams.map((r) => <span key={r} className="chip bg-mint">{r}</span>)}
              </div>
            )}
            {report.business.go_to_market?.length > 0 && (
              <>
                <p className="eyebrow mt-3 mb-1">Go-to-market</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  {report.business.go_to_market.map((g) => <li key={g}>{g}</li>)}
                </ol>
              </>
            )}
          </Block>
          <Block title="Risks">
            <ul className="space-y-2">
              {report.business.risks?.map((r) => (
                <li key={r.risk} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className="chip text-[10px] uppercase shrink-0" style={{ background: SEVERITY[r.severity?.toLowerCase()] ?? "var(--muted-surface)" }}>{r.severity || "risk"}</span>
                    <span className="font-semibold">{r.risk}</span>
                  </div>
                  {r.mitigation && <p className="text-muted-foreground mt-0.5 ml-1">↳ {r.mitigation}</p>}
                </li>
              ))}
            </ul>
          </Block>
        </div>
      )}

      {sources.length > 0 && (
        <details className="rounded-xl border-2 border-ink bg-card p-4">
          <summary className="cursor-pointer font-semibold text-sm">Web sources consulted ({sources.length})</summary>
          <ol className="mt-3 space-y-2">
            {sources.map((s) => (
              <li key={s.id} className="flex gap-2 text-sm">
                <span className="num text-xs font-bold size-6 shrink-0 flex items-center justify-center rounded border border-ink bg-yellow">{s.id}</span>
                <span className="min-w-0">
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold underline decoration-2 underline-offset-2 break-words">{s.title || s.domain}</a>
                  <span className="text-xs text-muted-foreground ml-1.5 inline-flex items-center gap-1"><Globe size={11} aria-hidden />{s.domain}</span>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.snippet}</p>
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

const CLAIM_STYLE = {
  implemented: { icon: CheckCircle2, bg: "var(--mint)", label: "Implemented" },
  partial: { icon: CircleDashed, bg: "var(--yellow)", label: "Partial" },
  not_found: { icon: XCircle, bg: "var(--coral)", label: "Not found in code" },
} as const;

export function ProductPanel({ report, repoUrl }: { report?: ProductReport | null; repoUrl?: string }) {
  if (!report || (report.status === "failed" && !report.claims?.length)) return <Unavailable report={report} what="product" />;
  const scores = report.scores ?? {};
  const items: [string, number | null | undefined, string | undefined][] = [
    ["Innovation", scores.innovation, report.rationales?.innovation],
    ["Theme fit", scores.theme_fit, report.rationales?.theme_fit],
    ["User experience", scores.user_experience, report.rationales?.user_experience],
    ["Completeness", scores.completeness, "Share of claimed features found in the code."],
  ];

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">{report.summary}</p>
      {report.wow_factor && (
        <div className="rounded-xl border-2 border-ink bg-violet/40 p-4 text-sm">
          <span className="eyebrow !text-ink">Wow factor</span>
          <p className="font-semibold mt-1">{report.wow_factor}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value, why]) => (
          <div key={label} className="rounded-xl border-2 border-ink bg-card p-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="font-bold">{label}</span>
              <span className="num font-bold">{formatScore(value)}</span>
            </div>
            <ScoreBar score={value} height={10} />
            {why && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{why}</p>}
          </div>
        ))}
      </div>

      {report.claims && report.claims.length > 0 && (
        <Block title="Claims checked against the code">
          <ul className="space-y-2">
            {report.claims.map((c, i) => {
              const s = CLAIM_STYLE[c.status] ?? CLAIM_STYLE.partial;
              const Icon = s.icon;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 items-start rounded-lg border-2 border-ink p-3"
                  style={{ background: `color-mix(in srgb, ${s.bg} 28%, var(--card))` }}
                >
                  <Icon size={18} className="shrink-0 mt-0.5" aria-label={s.label} />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{c.claim}</p>
                    <p className="text-muted-foreground">
                      {c.note}
                      {c.file && (
                        <>
                          {" "}
                          <a href={repoUrl && /[./]/.test(c.file) ? `${repoUrl}/blob/HEAD/${c.file}` : undefined} target="_blank" rel="noreferrer" className="num text-xs underline break-all">{c.file}</a>
                        </>
                      )}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Block>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Live demo">
          {report.demo ? (
            <div className="flex items-start gap-2 text-sm">
              {report.demo.reachable ? <CheckCircle2 size={18} className="text-ink fill-mint shrink-0" aria-hidden /> : <AlertTriangle size={18} className="fill-coral shrink-0" aria-hidden />}
              <div className="min-w-0">
                <a href={report.demo.url} target="_blank" rel="noreferrer" className="font-semibold underline break-all inline-flex items-center gap-1">
                  <Link2 size={13} aria-hidden /> {report.demo.title || report.demo.url}
                </a>
                <p className="text-muted-foreground">
                  {report.demo.reachable ? `Online (HTTP ${report.demo.status_code})` : `Not reachable — ${report.demo.detail ?? `HTTP ${report.demo.status_code}`}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No demo link was submitted.</p>
          )}
        </Block>
        <Block title="Similar submissions">
          {report.similar_submissions?.length ? (
            <ul className="space-y-1.5 text-sm">
              {report.similar_submissions.map((s) => (
                <li key={s.project_id} className="flex justify-between gap-2">
                  <a href={`/project/${s.project_id}`} className="underline truncate">{s.name}</a>
                  <span className="num text-muted-foreground">{Math.round(s.similarity * 100)}% similar</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No close duplicates in this hackathon.</p>
          )}
        </Block>
      </div>

      <Points title="What would raise the score" items={report.suggestions} tone="var(--sky)" />
    </div>
  );
}
