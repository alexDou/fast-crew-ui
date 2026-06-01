import { useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { POEM_SOURCE_STATUS } from "@/constants/status";

import type { PoemSourceStatusResponseType } from "@/types";

const TERMINAL_STATUSES = new Set<string>([
  POEM_SOURCE_STATUS.STAGE_1,
  POEM_SOURCE_STATUS.COMPLETE,
  POEM_SOURCE_STATUS.ERROR
]);

export function useProcessingStatusFetch(sourceId: number) {
  const t = useTranslations("Tuner");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PoemSourceStatusResponseType>({
    queryKey: [QUERY_KEYS.POEM_SOURCE_STATUS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerStatus(sourceId)).json<PoemSourceStatusResponseType>(),
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }
      const status = query.state.data?.status;
      if (!status || TERMINAL_STATUSES.has(status)) {
        return false;
      }
      return 5000;
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

  const status = isError ? POEM_SOURCE_STATUS.ERROR : data?.status || POEM_SOURCE_STATUS.PROCESSING;

  const invalidateStatus = () => {
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POEM_SOURCE_STATUS, sourceId] });
  };

  return {
    status,
    ready: data?.ready ?? false,
    questions: data?.questions ?? [],
    poetCandidates: data?.poet_candidates ?? [],
    message: data?.message ?? null,
    isLoading,
    isError: isError || status === POEM_SOURCE_STATUS.ERROR,
    isRetryExhausted: isError,
    refetch: invalidateStatus
  };
}
