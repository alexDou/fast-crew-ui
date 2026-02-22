import { useQuery } from "@tanstack/react-query";

interface StatusResponse {
  ready: boolean;
  status: "processing" | "success" | "error";
  poem_source_id: number;
}

export function useProcessingStatusFetch(sourceId: number) {
  const { data, isLoading, isError } = useQuery<StatusResponse>({
    queryKey: ["poem-source-status", sourceId],
    queryFn: async () => {
      const response = await fetch(`/api/tuner/status/${sourceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      return response.json();
    },
    refetchInterval: (query) => {
      // Stop polling if status is success or error
      const status = query.state.data?.status;
      return status === "success" || status === "error" ? false : 5000; // 10 seconds
    },
    refetchIntervalInBackground: false,
    retry: 3
  });

  return {
    status: data?.status || "processing",
    isLoading,
    isError: isError || data?.status === "error"
  };
}
