import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["poems", sourceId],
    queryFn: async () => {
      const response = await fetch(`/api/tuner/poems/${sourceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch poems");
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
