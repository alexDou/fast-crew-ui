import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookieStore, mockGet, mockJsonFn, mockRedirect } = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn()
  };
  const mockJsonFn = vi.fn();
  const mockGet = vi.fn(() => ({ json: mockJsonFn }));
  const mockRedirect = vi.fn();

  return {
    mockCookieStore,
    mockGet,
    mockJsonFn,
    mockRedirect
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect
}));

vi.mock("ky", () => {
  class MockHTTPError extends Error {
    response: { status: number; json: () => Promise<unknown> };

    constructor(responseBody: unknown, status = 500) {
      super("HTTPError");
      this.name = "HTTPError";
      this.response = {
        status,
        json: () => Promise.resolve(responseBody)
      };
    }
  }

  return {
    default: { get: mockGet },
    HTTPError: MockHTTPError
  };
});

import { HTTPError } from "ky";

import { GET } from "../route";

const createMockHttpError = (responseBody: unknown, status = 500) => {
  const MockHTTPError = HTTPError as unknown as new (
    responseBody: unknown,
    status?: number
  ) => Error;

  return new MockHTTPError(responseBody, status);
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
});

describe("/api/tuner/status/[sourceId] GET", () => {
  it("returns upstream status response on success", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockResolvedValueOnce({ ready: false, status: "processing", poem_source_id: 7 });

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "7" })
    });

    expect(mockGet).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/poem-source/7/ready",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" }
      })
    );

    await expect(response.json()).resolves.toEqual({
      ready: false,
      status: "processing",
      poem_source_id: 7
    });
  });

  it("maps 'indistinct content' detail into UI status payload", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockRejectedValueOnce(createMockHttpError({ detail: "indistinct content" }, 404));

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "12" })
    });

    await expect(response.json()).resolves.toEqual({
      ready: true,
      status: "error",
      poem_source_id: 12,
      message: "indistinct content"
    });
  });

  it("returns generic failure payload for non-indistinct HTTP errors", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockRejectedValueOnce(createMockHttpError({ detail: "Poem source not found" }, 404));

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "3" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to check status"
    });
  });
});
