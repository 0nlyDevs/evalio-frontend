import { useCallback, useState } from "react";
import { api, type ChatTurn } from "@/lib/api";

export interface ChatMessage extends ChatTurn {
  sources?: { path: string; start_line: number; end_line: number }[];
}

export function useChat(projectId?: string) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || pending) return;
      setPending(true);
      setError(null);
      const previous = history.filter((t) => t.output).map(({ input, output }) => ({ input, output }));
      setHistory((h) => [...h, { input: q, output: "" }]);
      try {
        const res = await api.chat({ project_id: projectId, question: q, chathistory: previous });
        // Replace only the optimistic turn — earlier turns stay on screen
        setHistory((h) => [...h.slice(0, -1), { input: q, output: res.answer, sources: res.sources }]);
      } catch (e) {
        setError((e as Error).message);
        setHistory((h) => h.slice(0, -1));
      } finally {
        setPending(false);
      }
    },
    [history, pending, projectId],
  );

  const reset = useCallback(() => {
    setHistory([]);
    setError(null);
  }, []);

  return { history, pending, error, ask, reset };
}
