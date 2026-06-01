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

import { useResultFetch } from "@/hooks/use-result-fetch";

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

describe("useResultFetch", () => {
  it("does not fetch poems until status is complete", () => {
    renderHook(
      () =>
        useResultFetch({
          sourceId: 1,
          status: POEM_SOURCE_STATUS.PROCESSING
        }),
      { wrapper: createWrapper() }
    );

    expect(mockJsonFn).not.toHaveBeenCalled();
  });

  it("returns a single poem with derived poet_name", async () => {
    mockJsonFn.mockResolvedValue([
      { id: 1, poem: "Roses are red", poet_id: 11 },
      { id: 2, poem: "ignored", poet_id: null }
    ]);

    const { result } = renderHook(
      () =>
        useResultFetch({
          sourceId: 1,
          status: POEM_SOURCE_STATUS.COMPLETE,
          poetCandidates: [
            {
              id: 11,
              name: "Walt Whitman",
              era: "19th century",
              known_for: "Free verse",
              style_markers: []
            }
          ]
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.poem?.poet_name).toBe("Walt Whitman");
      expect(result.current.poem).not.toHaveProperty("kind");
    });
  });
});
