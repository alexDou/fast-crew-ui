import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { PROCESSING_STATUS, type ProcessingStatusType } from "@/constants/status";

interface StatusResponse {
  ready: boolean;
  status: ProcessingStatusType;
  poem_source_id: number;
}

export function useProcessingStatusFetch(sourceId: number) {
  const t = useTranslations("Tuner");

  const { data, isLoading, isError } = useQuery<StatusResponse>({
    queryKey: [QUERY_KEYS.POEM_SOURCE_STATUS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerStatus(sourceId)).json<StatusResponse>(),
    refetchInterval: (query) => {
      // Stop polling if retries exhausted (query in error state)
      if (query.state.status === "error") return false;
      // Stop polling if status is success or error
      const status = query.state.data?.status;
      return status === PROCESSING_STATUS.SUCCESS || status === PROCESSING_STATUS.ERROR
        ? false
        : 5000;
    },
    refetchIntervalInBackground: false,
    retry: 3
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("error.retryExhaustedTitle"), {
        description: t("error.retryExhaustedMessage")
      });
    }
  }, [isError, t]);

  return {
    status: isError ? PROCESSING_STATUS.ERROR : data?.status || PROCESSING_STATUS.PROCESSING,
    isLoading,
    isError: isError || data?.status === PROCESSING_STATUS.ERROR,
    isRetryExhausted: isError
  };
}
