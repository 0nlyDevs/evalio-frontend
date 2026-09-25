import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isEvaluating } from "@/lib/api";
import { POLLING_INTERVAL_MS } from "@/lib/constants";

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.getProject(projectId!).then((r) => r.project),
    enabled: !!projectId,
    // Poll only while the jury is still deliberating
    refetchInterval: (query) => (query.state.data && isEvaluating(query.state.data) ? POLLING_INTERVAL_MS : false),
  });
}

export function useReevaluate(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.reevaluate(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
