import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCookieStore,
  mockLoginToAPI,
  mockRegisterToAPI,
  mockResendVerificationToAPI,
  mockFetch
} = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  };
  const mockLoginToAPI = vi.fn();
  const mockRegisterToAPI = vi.fn();
  const mockResendVerificationToAPI = vi.fn();
  const mockFetch = vi.fn();
  return {
    mockCookieStore,
    mockLoginToAPI,
    mockRegisterToAPI,
    mockResendVerificationToAPI,
    mockFetch
  };
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
  resendVerificationToAPI: mockResendVerificationToAPI,
  logoutFromAPI: vi.fn()
}));

vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "test",
    RECAPTCHA_SECRET_KEY: "test-recaptcha-secret",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!
  }
}));

let loginAction: typeof import("@/server/actions/auth")["loginAction"];
let registerAction: typeof import("@/server/actions/auth")["registerAction"];
let resendVerificationAction: typeof import("@/server/actions/auth")["resendVerificationAction"];

beforeAll(async () => {
  ({ loginAction, registerAction, resendVerificationAction } = await import(
    "@/server/actions/auth"
  ));
});

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({ success: true })
  });
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
    mockLoginToAPI.mockRejectedValueOnce(
      new Error("Email is not yet verified, please check your email")
    );

    const result = await loginAction("testuser", "testpass");

    expect(result).toEqual({
      success: false,
      error: "Email is not yet verified, please check your email"
    });
  });

  it("returns generic error message for non-Error throws", async () => {
    mockLoginToAPI.mockRejectedValueOnce("something weird");

    const result = await loginAction("testuser", "testpass");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("resendVerificationAction", () => {
  it("returns success when resend succeeds", async () => {
    mockResendVerificationToAPI.mockResolvedValueOnce(undefined);

    const result = await resendVerificationAction("testuser");

    expect(result).toEqual({ success: true });
  });

  it("returns error when resend fails", async () => {
    mockResendVerificationToAPI.mockRejectedValueOnce(new Error("failed"));

    const result = await resendVerificationAction("testuser");

    expect(result).toEqual({ success: false, error: "failed" });
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
      password: "pass123",
      captchaToken: "captcha-token"
    });

    expect(result).toEqual({ success: true });
    expect(mockRegisterToAPI).toHaveBeenCalledWith({
      name: "Test",
      username: "test",
      email: "t@t.com",
      password: "pass123"
    });
  });

  it("returns captcha validation error when reCAPTCHA check fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: false })
    });

    const result = await registerAction({
      name: "Test",
      username: "test",
      email: "t@t.com",
      password: "pass123",
      captchaToken: "captcha-token"
    });

    expect(result).toEqual({
      success: false,
      error: "Captcha validation failed"
    });
    expect(mockRegisterToAPI).not.toHaveBeenCalled();
  });

  it("returns error message from API on failure", async () => {
    mockRegisterToAPI.mockRejectedValueOnce(new Error("Email is already registered"));

    const result = await registerAction({
      name: "Test",
      username: "test",
      email: "t@t.com",
      password: "pass123",
      captchaToken: "captcha-token"
    });

    expect(result).toEqual({
      success: false,
      error: "Email is already registered"
    });
  });
});
