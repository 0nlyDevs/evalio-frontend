import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isEvaluating, type UpdateHackathonInput } from "@/lib/api";
import { POLLING_INTERVAL_MS } from "@/lib/constants";

export function useHackathons() {
  return useQuery({
    queryKey: ["hackathons"],
    queryFn: () => api.getAllHackathons().then((r) => r.hackathons ?? []),
    refetchInterval: (query) =>
      query.state.data?.some((h) => (h.stats.in_progress ?? 0) > 0) ? POLLING_INTERVAL_MS * 2 : false,
  });
}

export function useHackathon(id: number | string | undefined) {
  return useQuery({
    queryKey: ["hackathon", String(id)],
    queryFn: () => api.getHackathon(id!).then((r) => r.hackathon),
    enabled: !!id,
  });
}

/** Ranked projects of a hackathon; keeps polling while the jury is working. */
export function useLeaderboard(id: number | string | undefined) {
  return useQuery({
    queryKey: ["leaderboard", String(id)],
    queryFn: () => api.getLeaderboard(id!).then((r) => r.leaderboard ?? []),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.some(isEvaluating) ? POLLING_INTERVAL_MS : false),
  });
}

export function useUpdateHackathon(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateHackathonInput) => api.updateHackathon(id, input),
    onSuccess: ({ hackathon }) => {
      qc.setQueryData(["hackathon", String(id)], hackathon);
      qc.invalidateQueries({ queryKey: ["hackathons"] });
    },
  });
}
