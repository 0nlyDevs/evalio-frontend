"use client";

import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { HackathonCard } from "@/components/HackathonCard";
import { CreateHackathonModal } from "@/components/CreateHackathonModal";
import { EmptyState, ErrorBanner } from "@/components/EmptyState";
import { CountUp, Stagger, StaggerItem } from "@/components/motion";
import { useHackathons } from "@/lib/hooks/useHackathons";

export default function DashboardPage() {
  const { data: hackathons = [], isLoading, error, refetch } = useHackathons();
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(
    () =>
      hackathons.reduce(
        (acc, h) => ({
          open: acc.open + (h.phase === "open" ? 1 : 0),
          projects: acc.projects + (h.stats.projects ?? 0),
          judged: acc.judged + (h.stats.evaluated ?? 0),
        }),
        { open: 0, projects: 0, judged: 0 },
      ),
    [hackathons],
  );

  return (
    <div className="min-h-dvh">
      <Topbar />
      <main id="main" className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="eyebrow mb-2">Organizer console</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Your hackathons</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Create an event, set weighted criteria, and let the AI jury rank every submission with evidence.
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary self-start md:self-auto">
            <Plus size={18} /> New hackathon
          </button>
        </div>

        {hackathons.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <Kpi label="Open events" value={totals.open} tone="var(--mint)" />
            <Kpi label="Submissions" value={totals.projects} tone="var(--sky)" />
            <Kpi label="Judged by the AI jury" value={totals.judged} tone="var(--yellow)" />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <ErrorBanner message={(error as Error).message} onRetry={() => refetch()} />
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="brutal-card overflow-hidden">
                <div className="h-24 skeleton rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 skeleton" />
                  <div className="h-4 w-full skeleton" />
                  <div className="h-10 w-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : hackathons.length === 0 && !error ? (
          <EmptyState
            icon={Trophy}
            title="No hackathons yet"
            description="Create your first event. Participants submit a repo; three AI judges review the code, the market and the product."
            action={
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Create a hackathon
              </button>
            }
          />
        ) : (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((h, i) => (
              <StaggerItem key={h.id}>
                <HackathonCard hackathon={h} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </main>
      <CreateHackathonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="brutal-card p-4 relative overflow-hidden">
      <span className="absolute -right-4 -top-4 size-16 rounded-full border-2 border-ink" style={{ background: tone }} aria-hidden />
      <div className="num text-2xl sm:text-3xl font-bold relative"><CountUp value={value} /></div>
      <div className="text-xs sm:text-sm font-semibold text-muted-foreground relative">{label}</div>
    </div>
  );
}
