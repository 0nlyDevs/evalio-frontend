"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Search, SearchX, X } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState, ErrorBanner } from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion";
import { useSearch } from "@/lib/hooks/useSearch";

const HISTORY_KEY = "evalio_search_history";
const SUGGESTIONS = [
  "AI tools for teachers",
  "climate and energy tracking",
  "healthcare with computer vision",
  "developer productivity",
  "fintech for small businesses",
];

// Recent searches live in localStorage; this store lets React read them without effects.
const HISTORY_EVENT = "evalio-search-history";

function readHistoryRaw(): string {
  try {
    return localStorage.getItem(HISTORY_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribeHistory(callback: () => void) {
  window.addEventListener(HISTORY_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(HISTORY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function saveHistory(query: string) {
  try {
    const previous: string[] = JSON.parse(readHistoryRaw());
    localStorage.setItem(HISTORY_KEY, JSON.stringify([query, ...previous.filter((h) => h !== query)].slice(0, 6)));
    window.dispatchEvent(new Event(HISTORY_EVENT));
  } catch {
    // storage unavailable (private mode) — history is a convenience only
  }
}

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const rawHistory = useSyncExternalStore(subscribeHistory, readHistoryRaw, () => "[]");
  const history = useMemo<string[]>(() => {
    try {
      return JSON.parse(rawHistory);
    } catch {
      return [];
    }
  }, [rawHistory]);
  const { data: results = [], isFetching, error, refetch } = useSearch(query);

  // Debounce typing into the actual query
  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 350);
    return () => clearTimeout(t);
  }, [input]);

  // Remember queries that returned something
  useEffect(() => {
    if (query && !isFetching && results.length > 0) saveHistory(query);
  }, [query, isFetching, results.length]);

  const pick = (q: string) => {
    setInput(q);
    setQuery(q);
  };

  return (
    <div className="min-h-dvh">
      <Topbar />
      <main id="main" className="px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="eyebrow mb-2">Semantic search</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Find any submission by <span className="marker">what it does</span></h1>
          <p className="text-muted-foreground mt-2">Search across every hackathon by idea, audience or technology — not just keywords.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setQuery(input.trim()); }} className="max-w-3xl mx-auto relative mb-4" role="search">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor="search-q" className="sr-only">Search submissions</label>
          <input
            id="search-q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. apps that help farmers predict the weather"
            className="field !min-h-14 !text-base pl-12 pr-12 shadow-[var(--shadow-hard)]"
            autoFocus
          />
          {input && (
            <button type="button" onClick={() => pick("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted" aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </form>

        {!query && (
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2 mb-10">
            {(history.length ? history : SUGGESTIONS).map((s) => (
              <button key={s} onClick={() => pick(s)} className="chip hover:bg-yellow transition-colors">{s}</button>
            ))}
          </div>
        )}

        {error && <ErrorBanner message={(error as Error).message} onRetry={() => refetch()} />}

        {query.length > 1 && (
          isFetching && results.length === 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 skeleton" />)}
            </div>
          ) : results.length === 0 && !error ? (
            <div className="mt-6">
              <EmptyState icon={SearchX} title={`Nothing matches “${query}”`} description="Try describing the problem or the audience instead of a product name." />
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold mb-4 mt-6">{results.length} result{results.length > 1 ? "s" : ""} for “{query}”</p>
              <Stagger key={query} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {results.map((r) => (
                  <StaggerItem key={r.project.project_id}>
                    <ProjectCard project={r.project} match={r.score} />
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )
        )}
      </main>
    </div>
  );
}
