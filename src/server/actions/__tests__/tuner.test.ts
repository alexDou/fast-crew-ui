import { beforeEach, describe, expect, it, vi } from "vitest";

const TEST_API_URL = process.env.NEXT_PUBLIC_API_URL!;

const { mockCookieStore, mockJsonFn, mockPost, mockRedirect, mockPostJsonFn } = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn()
  };
  const mockJsonFn = vi.fn();
  const mockPostJsonFn = vi.fn();
  const mockPost = vi.fn((_url: string, options?: { json?: unknown }) => ({
    json: options?.json === undefined ? mockJsonFn : mockPostJsonFn
  }));
  const mockRedirect = vi.fn();
  return { mockCookieStore, mockJsonFn, mockPost, mockRedirect, mockPostJsonFn };
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

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!
  }
}));

import { HTTPError } from "ky";

import { submitAnswersAction, uploadAction } from "@/server/actions/tuner";

beforeEach(() => {
  vi.clearAllMocks();
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
      `${TEST_API_URL}/api/v1/poem-source`,
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" }
      })
    );
  });

  it("passes the uploaded file in FormData", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockJsonFn.mockResolvedValueOnce({ id: 1, media_path: "/x", status: "processing" });

    await uploadAction({ file });

    const callArgs = mockPost.mock.calls[0] as unknown as [string, { body: FormData }];
    const formData = callArgs[1].body;
    const formFile = formData.get("file");

    expect(formFile).toBeInstanceOf(File);
    expect(formFile).toBe(file);
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
    const httpError = new HTTPError(new Response(), new Request(TEST_API_URL), {} as never);
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
    const httpError = new HTTPError(new Response(), new Request(TEST_API_URL), {} as never);
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

describe("submitAnswersAction", () => {
  const answers = { q1: "A summer night by the sea", q2: "Tender and nostalgic" };

  it("forwards poet_id alongside answers to the backend", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockPostJsonFn.mockResolvedValueOnce({
      message: "Answers accepted",
      status: "generating",
      poem_source_id: 7
    });

    const result = await submitAnswersAction(7, { answers, poetId: 12 });

    expect(result).toEqual({
      success: true,
      data: {
        message: "Answers accepted",
        status: "generating",
        poem_source_id: 7
      }
    });
    expect(mockPost).toHaveBeenCalledWith(
      `${TEST_API_URL}/api/v1/poem-source/7/answers`,
      expect.objectContaining({
        json: { answers, poet_id: 12 },
        headers: { Authorization: "Bearer test-token" }
      })
    );
  });

  it("sends poet_id as null for the freestyle branch", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockPostJsonFn.mockResolvedValueOnce({
      message: "Answers accepted",
      status: "generating",
      poem_source_id: 7
    });

    await submitAnswersAction(7, { answers, poetId: null });

    expect(mockPost).toHaveBeenCalledWith(
      `${TEST_API_URL}/api/v1/poem-source/7/answers`,
      expect.objectContaining({
        json: { answers, poet_id: null }
      })
    );
  });

  it("returns error detail from API on HTTPError", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    const httpError = new HTTPError(new Response(), new Request(TEST_API_URL), {} as never);
    Object.assign(httpError, {
      response: {
        json: () =>
          Promise.resolve({ detail: "Answers must be provided for every follow-up question" })
      }
    });
    mockPostJsonFn.mockRejectedValueOnce(httpError);

    const result = await submitAnswersAction(7, { answers, poetId: null });

    expect(result).toEqual({
      success: false,
      error: "Answers must be provided for every follow-up question"
    });
  });

  it("returns generic generation-failed message when HTTPError has no detail", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    const httpError = new HTTPError(new Response(), new Request(TEST_API_URL), {} as never);
    Object.assign(httpError, {
      response: { json: () => Promise.resolve({}) }
    });
    mockPostJsonFn.mockRejectedValueOnce(httpError);

    const result = await submitAnswersAction(7, { answers, poetId: null });

    expect(result).toEqual({
      success: false,
      error: "Generation failed"
    });
  });

  it("returns generic error on non-HTTP exceptions", async () => {
    mockCookieStore.get.mockReturnValue({ value: "test-token" });
    mockPostJsonFn.mockRejectedValueOnce(new Error("Network failure"));

    const result = await submitAnswersAction(7, { answers, poetId: null });

    expect(result).toEqual({
      success: false,
      error: "An error occurred while generating the poem"
    });
  });

  it("redirects to signin when access token is missing", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await submitAnswersAction(7, { answers, poetId: null });

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });
});
