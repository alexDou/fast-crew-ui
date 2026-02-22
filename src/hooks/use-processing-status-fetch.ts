import { useQuery } from "@tanstack/react-query";

import { PROCESSING_STATUS, type ProcessingStatusType } from "@/constants/status";

interface StatusResponse {
  ready: boolean;
  status: ProcessingStatusType;
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
      return status === PROCESSING_STATUS.SUCCESS || status === PROCESSING_STATUS.ERROR
        ? false
        : 5000; // 10 seconds
    },
    refetchIntervalInBackground: false,
    retry: 3
  });

  return {
    status: data?.status || PROCESSING_STATUS.PROCESSING,
    isLoading,
    isError: isError || data?.status === PROCESSING_STATUS.ERROR
  };
}
