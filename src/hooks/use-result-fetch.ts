import { useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BFF_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { POEM_SOURCE_STATUS } from "@/constants/status";

import type { PoemType, PoetCardType } from "@/types";

interface UseResultFetchProps {
  sourceId: number;
  status: string;
  poetCandidates?: PoetCardType[];
}

export function useResultFetch({ sourceId, status, poetCandidates = [] }: UseResultFetchProps) {
  const t = useTranslations("Tuner");

  const {
    data: poems = [],
    isLoading,
    isError
  } = useQuery<PoemType[]>({
    queryKey: [QUERY_KEYS.POEMS, sourceId],
    queryFn: () => ky.get(BFF_ENDPOINTS.tunerPoems(sourceId)).json<PoemType[]>(),
    enabled: status === POEM_SOURCE_STATUS.COMPLETE,
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

  const poem = useMemo(() => {
    const first = poems[0];
    if (!first) {
      return null;
    }

    if (first.poet_name) {
      return first;
    }

    if (first.poet_id === null) {
      return { ...first, poet_name: undefined };
    }

    const matchedPoet = poetCandidates.find((candidate) => candidate.id === first.poet_id);
    return {
      ...first,
      poet_name: matchedPoet?.name
    };
  }, [poems, poetCandidates]);

  return {
    poem,
    isLoading,
    isError
  };
}
