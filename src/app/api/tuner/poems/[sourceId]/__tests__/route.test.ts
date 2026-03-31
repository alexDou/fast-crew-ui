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
    response: { status: number };

    constructor(status = 500) {
      super("HTTPError");
      this.name = "HTTPError";
      this.response = { status };
    }
  }

  return {
    default: { get: mockGet },
    HTTPError: MockHTTPError
  };
});

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: "https://api.example.com"
  }
}));

import { HTTPError } from "ky";

import { GET } from "../route";

const createMockHttpError = (status = 500) => {
  const MockHTTPError = HTTPError as unknown as new (status?: number) => Error;

  return new MockHTTPError(status);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("/api/tuner/poems/[sourceId] GET", () => {
  it("returns poem list from upstream data wrapper", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "7" })
    });

    expect(mockGet).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/poems/7",
      expect.objectContaining({
        headers: { Authorization: "Bearer access-token" }
      })
    );

    await expect(response.json()).resolves.toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("redirects to signin when access token is missing", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "8" })
    });

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });

  it("returns fetch-poems error payload for HTTP errors", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockRejectedValueOnce(createMockHttpError(404));

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "9" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch poems" });
  });

  it("returns internal server error payload for non-HTTP errors", async () => {
    mockCookieStore.get.mockReturnValue({ value: "access-token" });
    mockJsonFn.mockRejectedValueOnce(new Error("Network broke"));

    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ sourceId: "10" })
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Internal server error" });
  });
});
