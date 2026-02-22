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

import { PROCESSING_STATUS } from "@/constants/status";

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
  it("does not fetch when status is not success", async () => {
    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.PROCESSING }),
      { wrapper: createWrapper() }
    );

    expect(result.current.poems).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockJsonFn).not.toHaveBeenCalled();
  });

  it("fetches poems when status is success", async () => {
    const mockPoems = [
      { id: 1, poem: "Roses are red", critic_choice: false },
      { id: 2, poem: "Violets are blue", critic_choice: true }
    ];
    mockJsonFn.mockResolvedValue(mockPoems);

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.poems).toEqual(mockPoems);
    });
    expect(result.current.isError).toBe(false);
  });

  it("sets active poem to critic's choice when available", async () => {
    const mockPoems = [
      { id: 1, poem: "Roses are red", critic_choice: false },
      { id: 2, poem: "Violets are blue", critic_choice: true }
    ];
    mockJsonFn.mockResolvedValue(mockPoems);

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.activePoem).toEqual(mockPoems[1]);
    });
  });

  it("falls back to first poem when no critic's choice", async () => {
    const mockPoems = [
      { id: 1, poem: "Roses are red", critic_choice: false },
      { id: 2, poem: "Violets are blue", critic_choice: false }
    ];
    mockJsonFn.mockResolvedValue(mockPoems);

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.activePoem).toEqual(mockPoems[0]);
    });
  });

  it("handles empty poems array", async () => {
    mockJsonFn.mockResolvedValue([]);

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.poems).toEqual([]);
    expect(result.current.activePoem).toBeNull();
  });

  it("shows toast and sets error when retries exhausted", async () => {
    mockJsonFn.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToastError).toHaveBeenCalledWith("error.retryExhaustedTitle", {
      description: "error.retryExhaustedMessage"
    });
  });

  it("does not show toast on successful fetch", async () => {
    mockJsonFn.mockResolvedValue([{ id: 1, poem: "Test", critic_choice: false }]);

    const { result } = renderHook(
      () => useResultFetch({ sourceId: 1, status: PROCESSING_STATUS.SUCCESS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.poems.length).toBe(1);
    });

    expect(mockToastError).not.toHaveBeenCalled();
  });
});
