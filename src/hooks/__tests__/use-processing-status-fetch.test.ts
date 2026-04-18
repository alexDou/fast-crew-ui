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
import { act, renderHook, waitFor } from "@testing-library/react";
import ky from "ky";

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
    expect(result.current.isIndistinctContentFailure).toBe(false);
    expect(result.current.poemSourceId).toBe(1);
    expect(result.current.questions).toEqual([]);
  });

  it("exposes questions when backend reaches stage_1", async () => {
    mockJsonFn.mockResolvedValue({
      ready: true,
      status: "stage_1",
      poem_source_id: 1,
      questions: [
        { id: "q1", text: "What memory does this image wake up?" },
        { id: "q2", text: "What feeling should guide the poem?" }
      ]
    });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("stage_1");
    });

    expect(result.current.questions).toEqual([
      { id: "q1", text: "What memory does this image wake up?" },
      { id: "q2", text: "What feeling should guide the poem?" }
    ]);
    expect(result.current.isPollingEnabled).toBe(false);
  });

  it("resumes polling after stage_1 when requested", async () => {
    mockJsonFn
      .mockResolvedValueOnce({
        ready: true,
        status: "stage_1",
        poem_source_id: 1,
        questions: [{ id: "q1", text: "What memory does this image wake up?" }]
      })
      .mockResolvedValueOnce({
        ready: false,
        status: "generating",
        poem_source_id: 1
      });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("stage_1");
    });

    expect(result.current.isPollingEnabled).toBe(false);
    expect(ky.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.resumePolling();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("generating");
    });

    expect(result.current.isPollingEnabled).toBe(true);
    expect(ky.get).toHaveBeenCalledTimes(2);
  });

  it("normalizes legacy success status to complete and stops polling", async () => {
    mockJsonFn.mockResolvedValue({ ready: true, status: "success", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("complete");
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
    expect(result.current.isIndistinctContentFailure).toBe(false);
  });

  it("exposes indistinct content rejection message from API", async () => {
    mockJsonFn.mockResolvedValue({
      ready: true,
      status: "error",
      poem_source_id: 1,
      message: "indistinct content"
    });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.isIndistinctContentFailure).toBe(true);
    });

    expect(result.current.failureMessage).toBe("indistinct content");
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

  it("retries 3 times before giving up", async () => {
    mockJsonFn.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isRetryExhausted).toBe(true);
    });

    // 1 initial attempt + 3 retries = 4 total calls
    expect(ky.get).toHaveBeenCalledTimes(4);
  });

  it("does not show toast on complete response", async () => {
    mockJsonFn.mockResolvedValue({ ready: true, status: "success", poem_source_id: 1 });

    const { result } = renderHook(() => useProcessingStatusFetch(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.status).toBe("complete");
    });

    expect(mockToastError).not.toHaveBeenCalled();
  });
});
