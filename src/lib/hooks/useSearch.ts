import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSearch(query: string, hackathonId?: number | string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["search", q, hackathonId ?? null],
    queryFn: () => api.search(q, hackathonId).then((r) => r.results ?? []),
    enabled: q.length > 1,
    staleTime: 60_000,
  });
}
