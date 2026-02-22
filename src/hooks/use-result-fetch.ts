import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { BFF_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { PROCESSING_STATUS, type ProcessingStatusType } from "@/constants/status";

interface Poem {
  id: number;
  poem: string;
  critic_choice: boolean;
}

interface UseResultFetchProps {
  sourceId: number;
  status: ProcessingStatusType;
}

export function useResultFetch({ sourceId, status }: UseResultFetchProps) {
  const [activePoemId, setActivePoemId] = useState<number | null>(null);

  const { data: poems = [], isLoading } = useQuery<Poem[]>({
    queryKey: [QUERY_KEYS.POEMS, sourceId],
    queryFn: async () => {
      const response = await fetch(BFF_ENDPOINTS.tunerPoems(sourceId));

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.FETCH_POEMS_FAILED);
      }

      return response.json();
    },
    enabled: status === PROCESSING_STATUS.SUCCESS,
    retry: 4,
    staleTime: Infinity
  });

  // Set initial active poem when poems are loaded
  if (poems.length > 0 && activePoemId === null) {
    // Find critic's choice or use first poem
    const criticChoice = poems.find((p) => p.critic_choice);
    setActivePoemId(criticChoice ? criticChoice.id : poems[0].id);
  }

  const activePoem = poems.find((p) => p.id === activePoemId) || null;

  return {
    poems,
    activePoem,
    setActivePoemId,
    isLoading
  };
}
