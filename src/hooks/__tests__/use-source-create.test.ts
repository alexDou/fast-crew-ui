import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn()
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess
  }
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const { mockUploadAction } = vi.hoisted(() => ({
  mockUploadAction: vi.fn()
}));

vi.mock("@/server/actions/tuner", () => ({
  uploadAction: mockUploadAction
}));

import { act, renderHook } from "@testing-library/react";

import { useSourceCreate } from "@/hooks/use-source-create";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSourceCreate", () => {
  const mockFile = new File(["test"], "test.png", { type: "image/png" });

  it("starts in idle state with no sourceId", () => {
    const { result } = renderHook(() => useSourceCreate());

    expect(result.current.processing).toBe("idle");
    expect(result.current.sourceId).toBeNull();
  });

  it("sets sourceId and shows success toast on successful upload", async () => {
    mockUploadAction.mockResolvedValue({
      success: true,
      data: { id: 42, media_path: "/uploads/test.png", status: "processing" }
    });

    const { result } = renderHook(() => useSourceCreate());

    await act(async () => {
      await result.current.sourceCreate({ file: mockFile });
    });

    expect(result.current.sourceId).toBe(42);
    expect(result.current.processing).toBe("processing");
    expect(mockToastSuccess).toHaveBeenCalledWith("form.success.title", {
      description: "form.success.message"
    });
  });

  it("sets processing to error and shows error toast on failed upload", async () => {
    mockUploadAction.mockResolvedValue({
      success: false,
      error: "Upload failed"
    });

    const { result } = renderHook(() => useSourceCreate());

    await act(async () => {
      await result.current.sourceCreate({ file: mockFile });
    });

    expect(result.current.processing).toBe("error");
    expect(result.current.sourceId).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith("error.actionErrorTitle", {
      description: "error.actionErrorMessage"
    });
  });

  it("sets processing to error and shows error toast when exception is thrown", async () => {
    mockUploadAction.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSourceCreate());

    await act(async () => {
      await result.current.sourceCreate({ file: mockFile });
    });

    expect(result.current.processing).toBe("error");
    expect(result.current.sourceId).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith("error.actionErrorTitle", {
      description: "error.actionErrorMessage"
    });
  });
});
