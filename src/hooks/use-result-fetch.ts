import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { PROCESSING_STATUS, type ProcessingStatusType } from "@/constants/status";

import type { PoemType } from "@/types";

interface UseResultFetchProps {
  sourceId: number;
  status: ProcessingStatusType;
}

export function useResultFetch({ sourceId, status }: UseResultFetchProps) {
  const t = useTranslations("Tuner");
  const [selectedPoemId, setSelectedPoemId] = useState<number | null>(null);

  const {
    data: poems = [],
    isLoading,
    isError
  } = useQuery<PoemType[]>({
    queryKey: [QUERY_KEYS.POEMS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerPoems(sourceId)).json<PoemType[]>(),
    enabled: status === PROCESSING_STATUS.SUCCESS,
    retry: 4,
    staleTime: Infinity
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("error.retryExhaustedTitle"), {
        description: t("error.retryExhaustedMessage")
      });
    }
  }, [isError, t]);

  const activePoemId = selectedPoemId ?? poems[0]?.id ?? null;
  const activePoem = poems.find((p) => p.id === activePoemId) || null;

  return {
    poems,
    activePoem,
    setActivePoemId: setSelectedPoemId,
    isLoading,
    isError
  };
}
