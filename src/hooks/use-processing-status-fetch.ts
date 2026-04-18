import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS, PROCESSING_FAILURE_REASONS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  normalizeProcessingStatus,
  PROCESSING_STATUS,
  type ProcessingStatusType
} from "@/constants/status";
import type { PoemSourceStatusResponseType } from "@/types";

export function useProcessingStatusFetch(sourceId: number) {
  const t = useTranslations("Tuner");

  const { data, isLoading, isError } = useQuery<PoemSourceStatusResponseType>({
    queryKey: [QUERY_KEYS.POEM_SOURCE_STATUS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerStatus(sourceId)).json<PoemSourceStatusResponseType>(),
    refetchInterval: (query) => {
      // Stop polling if retries exhausted (query in error state)
      if (query.state.status === "error") return false;
      // Stop polling if status is complete or error
      const status = query.state.data?.status
        ? normalizeProcessingStatus(query.state.data.status)
        : undefined;
      return status === PROCESSING_STATUS.COMPLETE || status === PROCESSING_STATUS.ERROR
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

  const status = isError
    ? PROCESSING_STATUS.ERROR
    : data?.status
      ? normalizeProcessingStatus(data.status)
      : PROCESSING_STATUS.PROCESSING;

  return {
    status,
    poemSourceId: data?.poem_source_id ?? sourceId,
    questions: data?.questions ?? [],
    isLoading,
    isError: isError || status === PROCESSING_STATUS.ERROR,
    isRetryExhausted: isError,
    failureMessage: data?.message,
    isIndistinctContentFailure:
      data?.message?.trim().toLowerCase() === PROCESSING_FAILURE_REASONS.INDISTINCT_CONTENT
  };
}
