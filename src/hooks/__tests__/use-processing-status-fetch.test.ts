import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn()
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn()
  }
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const { mockJsonFn } = vi.hoisted(() => ({
  mockJsonFn: vi.fn()
}));

vi.mock("ky", () => ({
  default: {
    get: vi.fn(() => ({ json: mockJsonFn }))
  }
}));

import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { POEM_SOURCE_STATUS } from "@/constants/status";

import { useProcessingStatusFetch } from "@/hooks/use-processing-status-fetch";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0,
        gcTime: 0
      }
    }
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProcessingStatusFetch", () => {
  it("returns processing status while polling", async () => {
    mockJsonFn.mockResolvedValue({
      ready: false,
      status: POEM_SOURCE_STATUS.PROCESSING,
      poem_source_id: 1,
      questions: [],
      poet_candidates: []
    });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe(POEM_SOURCE_STATUS.PROCESSING);
    });
  });

  it("returns stage_1 questions and poet candidates", async () => {
    mockJsonFn.mockResolvedValue({
      ready: true,
      status: POEM_SOURCE_STATUS.STAGE_1,
      poem_source_id: 1,
      questions: [{ id: "q1", text: "Mood?" }],
      poet_candidates: [
        {
          id: 11,
          name: "Walt Whitman",
          era: "19th century",
          known_for: "Free verse",
          style_markers: ["long line"]
        }
      ]
    });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe(POEM_SOURCE_STATUS.STAGE_1);
      expect(result.current.questions).toHaveLength(1);
      expect(result.current.poetCandidates).toHaveLength(1);
    });
  });

  it("returns error status when API reports error", async () => {
    mockJsonFn.mockResolvedValue({
      ready: true,
      status: POEM_SOURCE_STATUS.ERROR,
      poem_source_id: 1,
      questions: [],
      poet_candidates: [],
      message: "indistinct content"
    });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe(POEM_SOURCE_STATUS.ERROR);
      expect(result.current.isError).toBe(true);
    });
  });
});
