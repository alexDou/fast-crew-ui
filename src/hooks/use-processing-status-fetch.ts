import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS, PROCESSING_FAILURE_REASONS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { normalizeProcessingStatus, PROCESSING_STATUS } from "@/constants/status";
import type { PoemSourceStatusResponseType, PoetCardType } from "@/types";

const EMPTY_POET_CANDIDATES: PoetCardType[] = [];

export function useProcessingStatusFetch(sourceId: number) {
  const t = useTranslations("Tuner");
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [hasResumedAfterStage1, setHasResumedAfterStage1] = useState(false);

  useEffect(() => {
    setIsPollingEnabled(true);
    setHasResumedAfterStage1(false);
  }, [sourceId]);

  const { data, isLoading, isError, refetch } = useQuery<PoemSourceStatusResponseType>({
    queryKey: [QUERY_KEYS.POEM_SOURCE_STATUS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerStatus(sourceId)).json<PoemSourceStatusResponseType>(),
    refetchInterval: (query) => {
      // Stop polling if retries exhausted (query in error state)
      if (query.state.status === "error") return false;
      if (!isPollingEnabled) return false;

      // Stop polling if status is complete or error
      const status = query.state.data?.status
        ? normalizeProcessingStatus(query.state.data.status)
        : undefined;

      if (status === PROCESSING_STATUS.STAGE_1 && !hasResumedAfterStage1) {
        return false;
      }

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

  useEffect(() => {
    if (status === PROCESSING_STATUS.STAGE_1 && !hasResumedAfterStage1) {
      setIsPollingEnabled(false);
    }
  }, [hasResumedAfterStage1, status]);

  const resumePolling = async () => {
    setHasResumedAfterStage1(true);
    setIsPollingEnabled(true);
    await refetch();
  };

  return {
    status,
    poemSourceId: data?.poem_source_id ?? sourceId,
    questions: data?.questions ?? [],
    poetCandidates: data?.poet_candidates ?? EMPTY_POET_CANDIDATES,
    isPollingEnabled,
    isLoading,
    isError: isError || status === PROCESSING_STATUS.ERROR,
    isRetryExhausted: isError,
    failureMessage: data?.message,
    resumePolling,
    isIndistinctContentFailure:
      data?.message?.trim().toLowerCase() === PROCESSING_FAILURE_REASONS.INDISTINCT_CONTENT
  };
}
