import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookieStore, mockLoginToAPI, mockRegisterToAPI } = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  };
  const mockLoginToAPI = vi.fn();
  const mockRegisterToAPI = vi.fn();
  return { mockCookieStore, mockLoginToAPI, mockRegisterToAPI };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

vi.mock("ky", () => ({
  default: { get: vi.fn(() => ({ json: vi.fn() })) },
  HTTPError: class extends Error {
    response = { status: 500 };
  }
}));

vi.mock("@/server/api/auth", () => ({
  loginToAPI: mockLoginToAPI,
  registerToAPI: mockRegisterToAPI,
  logoutFromAPI: vi.fn()
}));

import { loginAction, registerAction } from "@/server/actions/auth";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
});

describe("loginAction", () => {
  it("returns success and sets cookie when login succeeds", async () => {
    mockLoginToAPI.mockResolvedValueOnce("access-token-123");

    const result = await loginAction("testuser", "testpass");

    expect(result).toEqual({ success: true });
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "access_token",
      "access-token-123",
      expect.objectContaining({ httpOnly: true, path: "/" })
    );
  });

  it("returns error when loginToAPI returns null", async () => {
    mockLoginToAPI.mockResolvedValueOnce(null);

    const result = await loginAction("testuser", "testpass");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns email verification error from API", async () => {
    mockLoginToAPI.mockRejectedValueOnce(new Error("Please verify your email before logging in."));

    const result = await loginAction("testuser", "testpass");

    expect(result).toEqual({
      success: false,
      error: "Please verify your email before logging in."
    });
  });

  it("returns generic error message for non-Error throws", async () => {
    mockLoginToAPI.mockRejectedValueOnce("something weird");

    const result = await loginAction("testuser", "testpass");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("registerAction", () => {
  it("returns success on successful registration", async () => {
    mockRegisterToAPI.mockResolvedValueOnce({
      id: 1,
      name: "Test",
      username: "test",
      email: "t@t.com"
    });

    const result = await registerAction({
      name: "Test",
      username: "test",
      email: "t@t.com",
      password: "pass123"
    });

    expect(result).toEqual({ success: true });
  });

  it("returns error message from API on failure", async () => {
    mockRegisterToAPI.mockRejectedValueOnce(new Error("Email is already registered"));

    const result = await registerAction({
      name: "Test",
      username: "test",
      email: "t@t.com",
      password: "pass123"
    });

    expect(result).toEqual({
      success: false,
      error: "Email is already registered"
    });
  });
});
