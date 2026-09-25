"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PROJECT_TYPES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "./Modal";

// github.com / gitlab.com / bitbucket.org + owner/repo (dots, dashes and underscores allowed)
const REPO_RE = /^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/[\w.-]+\/[\w.-]+(\.git)?\/?(\/.*)?$/i;

function validate(values: { name: string; short: string; github: string; demo: string }) {
  return {
    name: values.name.trim().length > 80 ? "Keep the name under 80 characters" : null,
    short: values.short.trim().length < 5 ? "Describe the project in at least 5 characters" : values.short.length > 160 ? "Keep the tagline under 160 characters" : null,
    github: !REPO_RE.test(values.github.trim()) ? "Paste a public repository URL, e.g. https://github.com/team/project" : null,
    demo: values.demo && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(values.demo.trim()) ? "That doesn't look like a URL" : null,
  };
}

export function AddProjectModal({
  open, onClose, hackathonId,
}: {
  open: boolean;
  onClose: () => void;
  hackathonId?: number | string;
}) {
  const qc = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [long, setLong] = useState("");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [projectType, setProjectType] = useState("OTHER");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = validate({ name, short, github, demo });
  const show = (field: keyof typeof errors) => (touched[field] || touched.submit) && errors[field];

  const mut = useMutation({
    mutationFn: api.createProject,
    onSuccess: (res) => {
      toast.success("Submitted — the jury is on it");
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["hackathons"] });
      setName(""); setShort(""); setLong(""); setGithub(""); setDemo(""); setProjectType("OTHER"); setTouched({});
      onClose();
      router.push(`/project/${res.project_id}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setTouched({ submit: true });
    if (Object.values(errors).some(Boolean)) return;
    mut.mutate({
      name: name.trim() || undefined,
      shortDescription: short.trim(),
      longDescription: long.trim(),
      githubLink: github.trim(),
      demoLink: demo.trim() || undefined,
      hackathonId,
      projectType,
    });
  };

  const blur = (field: string) => () => setTouched((t) => ({ ...t, [field]: true }));

  return (
    <Modal open={open} onClose={onClose} title="Submit a project" subtitle="The jury clones the repo, reads the code and researches the market.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="p-name" label="Project name" error={show("name")}>
            <input id="p-name" className="field" value={name} onChange={(e) => setName(e.target.value)} onBlur={blur("name")} placeholder="e.g. GreenRoute" maxLength={80} />
          </Field>
          <div>
            <span className="label">Main framework</span>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="field !h-11 w-full" aria-label="Main framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-ink max-h-72">
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Field id="p-short" label="Tagline *" error={show("short")}>
          <input id="p-short" className="field" value={short} onChange={(e) => setShort(e.target.value)} onBlur={blur("short")} placeholder="One sentence: what it does and for whom" maxLength={160} aria-invalid={!!show("short")} />
        </Field>

        <Field id="p-long" label="Description" hint="List the features you built — the Product Judge checks each one against your code.">
          <textarea id="p-long" className="field resize-y" rows={4} value={long} onChange={(e) => setLong(e.target.value)} placeholder="The problem, who has it, and what your project does about it." maxLength={6000} />
        </Field>

        <Field id="p-github" label="Repository URL *" error={show("github")}>
          <input id="p-github" type="url" inputMode="url" className="field" value={github} onChange={(e) => setGithub(e.target.value)} onBlur={blur("github")} placeholder="https://github.com/team/project" aria-invalid={!!show("github")} />
        </Field>

        <Field id="p-demo" label="Demo link" error={show("demo")} hint="Optional — the jury checks that it's live.">
          <input id="p-demo" type="url" inputMode="url" className="field" value={demo} onChange={(e) => setDemo(e.target.value)} onBlur={blur("demo")} placeholder="https://my-project.vercel.app" aria-invalid={!!show("demo")} />
        </Field>

        <button type="submit" className="btn btn-primary w-full" disabled={mut.isPending}>
          {mut.isPending ? "Submitting…" : "Submit to the jury"}
        </button>
      </form>
    </Modal>
  );
}

function Field({
  id, label, error, hint, children,
}: {
  id: string;
  label: string;
  error?: string | null | false;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? (
        <p className="text-sm text-[#b42318] mt-1.5" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}
