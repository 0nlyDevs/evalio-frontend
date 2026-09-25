"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, FileCode2, RotateCcw, Sparkles } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";

const SUGGESTIONS = [
  "What's the weakest part of the code?",
  "Is it really different from its competitors?",
  "Which claimed features are missing?",
  "What should the team fix first?",
];

export function ChatInterface({ projectId, repoUrl }: { projectId?: string; repoUrl?: string }) {
  const { history, pending, error, ask, reset } = useChat(projectId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, pending]);

  const send = (q: string) => {
    if (!q.trim() || pending) return;
    ask(q);
    setInput("");
  };

  return (
    <section className="brutal-card flex flex-col overflow-hidden" aria-label="Ask the jury">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-ink bg-ink text-paper">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow" aria-hidden />
          <h2 className="font-bold text-sm">Ask the jury</h2>
        </div>
        {history.length > 0 && (
          <button onClick={reset} className="text-xs font-semibold flex items-center gap-1 opacity-80 hover:opacity-100" aria-label="Clear conversation">
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[260px] max-h-[460px]" aria-live="polite">
        {history.length === 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              The jury answers from its reports and the project&apos;s indexed code.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="chip hover:bg-yellow transition-colors text-left whitespace-normal">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {history.map((turn, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-xl rounded-br-sm border-2 border-ink bg-yellow px-3 py-2 text-sm">{turn.input}</p>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[92%] rounded-xl rounded-bl-sm border-2 border-ink bg-card px-3 py-2 text-sm shadow-[var(--shadow-hard-sm)]">
                  {turn.output ? (
                    <>
                      <RichText text={turn.output} />
                      {turn.sources && turn.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-ink/30 flex flex-wrap gap-1">
                          {turn.sources.slice(0, 4).map((s) => (
                            <a
                              key={`${s.path}:${s.start_line}`}
                              href={repoUrl ? `${repoUrl}/blob/HEAD/${s.path}#L${s.start_line}-L${s.end_line}` : undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="chip text-[11px] bg-muted hover:bg-sky"
                            >
                              <FileCode2 size={11} aria-hidden /> {s.path.split("/").slice(-2).join("/")}:{s.start_line}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="flex gap-1 py-1" aria-label="The jury is thinking">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-2 rounded-full bg-ink"
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {error && <p role="alert" className="text-sm rounded-lg border-2 border-ink bg-coral/40 px-3 py-2">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 p-3 border-t-2 border-ink bg-paper"
      >
        <label htmlFor="chat-input" className="sr-only">Your question</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about code, market, claims…"
          className="field min-h-10 py-2"
          maxLength={2000}
        />
        <button type="submit" className="btn btn-dark !px-3" disabled={pending || !input.trim()} aria-label="Send question">
          <ArrowUp size={18} />
        </button>
      </form>
    </section>
  );
}

/** Minimal, safe markdown: paragraphs, bullet lists, **bold** and `code`. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-1">
          {list.map((item, i) => <li key={i}>{inline(item)}</li>)}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^([-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      list.push(bullet[2]);
      continue;
    }
    flush();
    if (line) blocks.push(<p key={`p-${blocks.length}`} className="my-1 leading-relaxed">{inline(line.replace(/^#+\s*/, ""))}</p>);
  }
  flush();
  return <div>{blocks}</div>;
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="num text-[0.85em] bg-muted border border-ink/20 rounded px-1 py-0.5 break-all">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <span key={i}>{part}</span>;
  });
}
