"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import { isEvaluating, type Project } from "@/lib/api";
import { repoLabel, timeAgo } from "@/lib/utils";
import { JudgeScores, ScorePill } from "./score";
import { FlagCount, StatusPill } from "./status";

export function ProjectCard({ project, match }: { project: Project; match?: number | null }) {
  const evaluating = isEvaluating(project);

  return (
    <Link href={`/project/${project.project_id}`} className="block brutal-card brutal-lift p-5 h-full">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-base leading-snug line-clamp-1">{project.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{project.short_description}</p>
        </div>
        {project.overall_score !== null ? (
          <ScorePill score={project.overall_score} className="shrink-0 text-sm" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 my-3">
        <StatusPill status={project.status} />
        {project.rank ? <span className="chip bg-yellow num">#{project.rank}</span> : null}
        <FlagCount flags={project.flags ?? []} />
        {match !== undefined && match !== null && (
          <span className="chip bg-sky num">{Math.round(match * 100)}% match</span>
        )}
      </div>

      {!evaluating && project.overall_score !== null && (
        <div className="pt-3 border-t-2 border-dashed border-ink/30">
          <JudgeScores scores={project.judge_scores} compact />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 min-w-0">
          <GitBranch size={13} aria-hidden className="shrink-0" />
          <span className="truncate">{repoLabel(project.github_link).replace(/^github\.com\//, "")}</span>
        </span>
        <span className="shrink-0">{timeAgo(project.created_at)}</span>
      </div>
    </Link>
  );
}
