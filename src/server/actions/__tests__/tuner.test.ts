import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookieStore, mockJsonFn, mockPost, mockRedirect } = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn()
  };
  const mockJsonFn = vi.fn();
  const mockPost = vi.fn(() => ({ json: mockJsonFn }));
  const mockRedirect = vi.fn();
  return { mockCookieStore, mockJsonFn, mockPost, mockRedirect };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect
}));

vi.mock("ky", () => {
  class MockHTTPError extends Error {
    response: { json: () => Promise<unknown> };
    constructor(responseBody: unknown) {
      super("HTTPError");
      this.name = "HTTPError";
      this.response = { json: () => Promise.resolve(responseBody) };
    }
  }
  return {
    default: { post: mockPost },
    HTTPError: MockHTTPError
  };
});

import { HTTPError } from "ky";

import { uploadAction } from "@/server/actions/tuner";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
});

describe("uploadAction", () => {
  const file = new File(["test"], "test.png", { type: "image/png" });

  it("returns success with data on successful upload", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockJsonFn.mockResolvedValueOnce({
      id: 42,
      media_path: "/uploads/test.png",
      status: "processing"
    });

    const result = await uploadAction({ file });

    expect(result).toEqual({
      success: true,
      data: {
        id: 42,
        media_path: "/uploads/test.png",
        status: "processing"
      }
    });
    expect(mockPost).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/poem-source",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" }
      })
    );
  });

  it("passes enhance parameter in FormData when provided", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockJsonFn.mockResolvedValueOnce({ id: 1, media_path: "/x", status: "processing" });

    await uploadAction({ file, enhance: "yes" });

    const callArgs = mockPost.mock.calls[0] as unknown as [string, { body: FormData }];
    const formData = callArgs[1].body;
    expect(formData.get("enhance")).toBe("yes");
  });

  it("returns error with detail from API on HTTPError", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    const httpError = new HTTPError(
      new Response(),
      new Request("https://api.example.com"),
      {} as never
    );
    // Override response.json for our mock
    Object.assign(httpError, {
      response: { json: () => Promise.resolve({ detail: "File too large" }) }
    });
    mockJsonFn.mockRejectedValueOnce(httpError);

    const result = await uploadAction({ file });

    expect(result).toEqual({
      success: false,
      error: "File too large"
    });
  });

  it("returns fallback error message when HTTPError has no detail", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    const httpError = new HTTPError(
      new Response(),
      new Request("https://api.example.com"),
      {} as never
    );
    Object.assign(httpError, {
      response: { json: () => Promise.resolve({}) }
    });
    mockJsonFn.mockRejectedValueOnce(httpError);

    const result = await uploadAction({ file });

    expect(result).toEqual({
      success: false,
      error: "Upload failed"
    });
  });

  it("returns generic error on non-HTTP exceptions", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockJsonFn.mockRejectedValueOnce(new Error("Network failure"));

    const result = await uploadAction({ file });

    expect(result).toEqual({
      success: false,
      error: "An error occurred during upload"
    });
  });

  it("redirects to signin when access token is missing", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await uploadAction({ file });

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });
});
