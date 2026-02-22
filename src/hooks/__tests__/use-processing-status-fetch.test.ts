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
    mockJsonFn.mockResolvedValue({ ready: false, status: "processing", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("processing");
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.isRetryExhausted).toBe(false);
  });

  it("returns success status and stops polling", async () => {
    mockJsonFn.mockResolvedValue({ ready: true, status: "success", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
    expect(result.current.isError).toBe(false);
  });

  it("returns error status when API reports error", async () => {
    mockJsonFn.mockResolvedValue({ ready: true, status: "error", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.isRetryExhausted).toBe(false);
  });

  it("shows toast and sets error status when retries exhausted", async () => {
    mockJsonFn.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.isRetryExhausted).toBe(true);
    expect(mockToastError).toHaveBeenCalledWith("error.retryExhaustedTitle", {
      description: "error.retryExhaustedMessage"
    });
  });

  it("does not show toast on successful response", async () => {
    mockJsonFn.mockResolvedValue({ ready: true, status: "success", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(mockToastError).not.toHaveBeenCalled();
  });
});
