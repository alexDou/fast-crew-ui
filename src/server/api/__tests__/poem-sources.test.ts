import { describe, expect, it, vi, beforeEach } from "vitest";

const mockKyGet = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());
const mockCookiesGet = vi.hoisted(() => vi.fn());

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" }
}));

vi.mock("ky", () => ({
  default: {
    get: mockKyGet
  }
}));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet })
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect
}));

import { getPoemSources } from "../poem-sources";

describe("getPoemSources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches poem sources with access token", async () => {
    const mockSources = [
      { id: 1, media_path: "/img/1.jpg", status: "ready", created_at: "2026-01-01T00:00:00Z" }
    ];
    mockCookiesGet.mockReturnValue({ value: "test-token" });
    mockKyGet.mockReturnValue({ json: () => Promise.resolve(mockSources) });

    const result = await getPoemSources();

    expect(result).toEqual(mockSources);
    expect(mockKyGet).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/poem-sources",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" }
      })
    );
  });

  it("redirects to signin when no access token", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    await getPoemSources();

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });

  it("throws when API call fails", async () => {
    mockCookiesGet.mockReturnValue({ value: "test-token" });
    mockKyGet.mockReturnValue({ json: () => Promise.reject(new Error("Network error")) });

    await expect(getPoemSources()).rejects.toThrow("Network error");
  });
});
