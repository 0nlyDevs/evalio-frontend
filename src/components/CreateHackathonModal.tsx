"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, type JudgeKey } from "@/lib/api";
import { JUDGE_COLORS } from "@/lib/constants";
import { Modal } from "./Modal";

interface CriterionDraft {
  id: number;
  name: string;
  weight: number;
}

const DEFAULT_CRITERIA: Omit<CriterionDraft, "id">[] = [
  { name: "Technical Execution", weight: 30 },
  { name: "Innovation", weight: 25 },
  { name: "Market Potential", weight: 25 },
  { name: "Theme Alignment", weight: 20 },
];

// Mirrors the backend routing (services/criteria.py) so organisers see which judge scores what
const ROUTING: [JudgeKey, string[]][] = [
  ["code", ["code", "quality", "technical", "tech", "architecture", "scalab", "security", "performance", "test", "documentation", "docs", "stack", "implementation", "engineering", "complexity", "maintainab", "execution", "robust", "api", "infra", "devops", "clean", "reliab", "algorithm", "backend", "frontend"]],
  ["market", ["market", "business", "commercial", "revenue", "monetiz", "monetis", "viab", "impact", "social", "adoption", "customer", "competit", "startup", "sustainab", "environment", "economic", "traction", "growth", "feasib"]],
  ["product", ["innovat", "creativ", "original", "novel", "idea", "theme", "relevan", "alignment", "design", "ux", "ui", "usab", "presentation", "pitch", "demo", "complete", "functional", "feature", "wow", "polish", "accessib", "problem"]],
];

function routeCriterion(name: string): JudgeKey {
  const lower = name.toLowerCase();
  let best: JudgeKey = "product";
  let bestScore = 0;
  for (const [judge, keywords] of ROUTING) {
    const score = keywords.reduce((s, k) => (new RegExp(`(^|[^a-z])${k}`).test(lower) ? s + k.length : s), 0);
    if (score > bestScore) {
      best = judge;
      bestScore = score;
    }
  }
  return best;
}

const JUDGE_NAMES: Record<JudgeKey, string> = { code: "Code Judge", market: "Market Judge", product: "Product Judge" };

let nextId = 100;

export function CreateHackathonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<CriterionDraft[]>(DEFAULT_CRITERIA.map((c, i) => ({ ...c, id: i })));
  const [startsAt, setStartsAt] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isAllowed, setIsAllowed] = useState(true);
  const [touched, setTouched] = useState(false);

  const totalWeight = criteria.reduce((s, c) => s + (c.weight || 0), 0);
  const nameError = name.trim().length < 3 ? "Give the hackathon a name (3+ characters)" : null;
  const dateError = startsAt && deadline && new Date(deadline) <= new Date(startsAt) ? "The deadline must be after the start" : null;
  const criteriaError = criteria.filter((c) => c.name.trim()).length === 0 ? "Add at least one criterion" : null;

  const reset = () => {
    setName(""); setDescription(""); setThemes([]); setTechnologies([]);
    setCriteria(DEFAULT_CRITERIA.map((c, i) => ({ ...c, id: i })));
    setStartsAt(""); setDeadline(""); setIsAllowed(true); setTouched(false);
  };

  const mut = useMutation({
    mutationFn: api.createHackathon,
    onSuccess: (res) => {
      toast.success("Hackathon created — share it and start collecting submissions");
      qc.invalidateQueries({ queryKey: ["hackathons"] });
      reset();
      onClose();
      router.push(`/hackathon/${res.hackathon_id}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError || dateError || criteriaError) return;
    mut.mutate({
      name: name.trim(),
      description: description.trim(),
      theme: themes.join(", "),
      technologies: technologies.join(", "),
      criteria: criteria.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), weight: c.weight })),
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      isAllowed,
    });
  };

  const updateCriterion = (id: number, patch: Partial<CriterionDraft>) =>
    setCriteria((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <Modal open={open} onClose={onClose} title="New hackathon" subtitle="Tell the jury what matters and how much." width="max-w-2xl">
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="hk-name" className="label">Name *</label>
          <input
            id="hk-name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Climate Hack 2026"
            maxLength={120}
            aria-invalid={touched && !!nameError}
            aria-describedby="hk-name-err"
          />
          {touched && nameError && <p id="hk-name-err" className="text-sm text-[#b42318] mt-1.5">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="hk-desc" className="label">Brief</label>
          <textarea
            id="hk-desc"
            className="field resize-y"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="The challenge participants are solving. The judges read this to assess theme fit."
            maxLength={4000}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TagField id="hk-themes" label="Themes" tags={themes} onChange={setThemes} placeholder="Climate, Health…" />
          <TagField
            id="hk-tech"
            label="Expected technologies"
            hint="Projects using none of them get flagged"
            tags={technologies}
            onChange={setTechnologies}
            placeholder="Python, React…"
          />
        </div>

        <fieldset>
          <div className="flex items-end justify-between mb-2">
            <legend className="label mb-0">Judging criteria & weights</legend>
            <span className="num text-xs text-muted-foreground">total weight {totalWeight}</span>
          </div>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {criteria.map((c) => {
                const judge = routeCriterion(c.name || "x");
                const share = totalWeight ? Math.round(((c.weight || 0) / totalWeight) * 100) : 0;
                return (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border-2 border-ink bg-card p-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className="field min-h-9 py-1.5 flex-1"
                        value={c.name}
                        onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                        placeholder="Criterion name"
                        aria-label="Criterion name"
                        maxLength={80}
                      />
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setCriteria((cs) => cs.filter((x) => x.id !== c.id))}
                        aria-label={`Remove ${c.name || "criterion"}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={5}
                        value={c.weight}
                        onChange={(e) => updateCriterion(c.id, { weight: Number(e.target.value) })}
                        className="flex-1 accent-[var(--ink)]"
                        aria-label={`Weight of ${c.name || "criterion"}`}
                      />
                      <span className="num text-sm font-bold w-10 text-right">{share}%</span>
                      <span className="chip text-[11px]" style={{ background: JUDGE_COLORS[judge] }} title="Judge who scores this criterion">
                        {JUDGE_NAMES[judge]}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <button
            type="button"
            className="btn btn-sm mt-3"
            onClick={() => setCriteria((cs) => [...cs, { id: nextId++, name: "", weight: 10 }])}
            disabled={criteria.length >= 8}
          >
            <Plus size={14} /> Add criterion
          </button>
          {touched && criteriaError && <p className="text-sm text-[#b42318] mt-1.5">{criteriaError}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hk-start" className="label">Starts</label>
            <input id="hk-start" type="datetime-local" className="field" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Commits before this are flagged.</p>
          </div>
          <div>
            <label htmlFor="hk-deadline" className="label">Submission deadline</label>
            <input
              id="hk-deadline"
              type="datetime-local"
              className="field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              aria-invalid={touched && !!dateError}
            />
            {touched && dateError && <p className="text-sm text-[#b42318] mt-1">{dateError}</p>}
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border-2 border-ink p-4 cursor-pointer" style={{ background: isAllowed ? "var(--mint)" : "var(--card)" }}>
          <span>
            <span className="block font-bold">Accept submissions now</span>
            <span className="text-sm text-muted-foreground">{isAllowed ? "Participants can submit right away." : "You can open submissions later."}</span>
          </span>
          <input type="checkbox" className="sr-only peer" checked={isAllowed} onChange={(e) => setIsAllowed(e.target.checked)} />
          <span className="relative w-12 h-7 rounded-full border-2 border-ink bg-card shrink-0 peer-focus-visible:outline peer-focus-visible:outline-3" aria-hidden>
            <motion.span
              className="absolute top-0.5 size-5 rounded-full bg-ink"
              animate={{ left: isAllowed ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={mut.isPending}>
          {mut.isPending ? "Creating…" : "Create hackathon"}
        </button>
      </form>
    </Modal>
  );
}

function TagField({
  id, label, hint, tags, onChange, placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const value = input.trim().replace(/,$/, "");
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) onChange([...tags, value.slice(0, 50)]);
    setInput("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="field flex flex-wrap gap-1.5 items-center min-h-11 py-1.5 focus-within:shadow-[3px_3px_0_var(--ink)]">
        {tags.map((t) => (
          <span key={t} className="chip bg-yellow">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="opacity-70 hover:opacity-100">
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={tags.length ? "" : placeholder}
          className="flex-1 min-w-[90px] outline-none bg-transparent text-sm py-1"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{hint ?? "Press Enter to add"}</p>
    </div>
  );
}
