import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPost, mockJsonFn } = vi.hoisted(() => {
  const mockJsonFn = vi.fn();
  const mockPost = vi.fn(() => ({ json: mockJsonFn }));
  return { mockPost, mockJsonFn };
});

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" }
}));

vi.mock("ky", () => {
  class MockHTTPError extends Error {
    response: { json: () => Promise<unknown> };
    constructor(detail?: string) {
      super("HTTPError");
      this.name = "HTTPError";
      this.response = { json: () => Promise.resolve({ detail }) };
    }
  }
  return {
    default: { post: mockPost },
    HTTPError: MockHTTPError
  };
});

import { HTTPError } from "ky";
import { loginToAPI, registerToAPI, resendVerificationToAPI } from "../auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loginToAPI", () => {
  it("returns access token on successful login", async () => {
    mockJsonFn.mockResolvedValueOnce({ access_token: "test-token", token_type: "bearer" });

    const result = await loginToAPI("testuser", "testpass");

    expect(result).toBe("test-token");
    expect(mockPost).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/login",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("throws error with detail when API returns email not verified", async () => {
    const httpError = new HTTPError(
      new Response(),
      new Request("https://api.example.com"),
      {} as never
    );
    Object.assign(httpError, {
      response: {
        json: () =>
          Promise.resolve({ detail: "Email is not yet verified, please check your email" })
      }
    });
    mockJsonFn.mockRejectedValueOnce(httpError);

    await expect(loginToAPI("testuser", "testpass")).rejects.toThrow(
      "Email is not yet verified, please check your email"
    );
  });

  it("throws error with fallback message when HTTPError has no detail", async () => {
    const httpError = new HTTPError(
      new Response(),
      new Request("https://api.example.com"),
      {} as never
    );
    Object.assign(httpError, {
      response: { json: () => Promise.resolve({}) }
    });
    mockJsonFn.mockRejectedValueOnce(httpError);

    await expect(loginToAPI("testuser", "testpass")).rejects.toThrow("Login failed");
  });

  it("returns null on non-HTTP errors", async () => {
    mockJsonFn.mockRejectedValueOnce(new Error("Network error"));

    const result = await loginToAPI("testuser", "testpass");

    expect(result).toBeNull();
  });
});

describe("resendVerificationToAPI", () => {
  it("posts identifier to resend endpoint", async () => {
    mockJsonFn.mockResolvedValueOnce({ message: "ok" });

    await resendVerificationToAPI("testuser");

    expect(mockPost).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/resend-verification",
      expect.objectContaining({
        json: { identifier: "testuser" }
      })
    );
  });
});

describe("registerToAPI", () => {
  it("returns user data on successful registration", async () => {
    const mockUser = {
      id: 1,
      name: "Test",
      username: "test",
      email: "test@test.com",
      tier_id: null,
      is_email_verified: false
    };
    mockJsonFn.mockResolvedValueOnce(mockUser);

    const result = await registerToAPI({
      name: "Test",
      username: "test",
      email: "test@test.com",
      password: "pass123"
    });

    expect(result).toEqual(mockUser);
  });

  it("throws error with detail on HTTPError", async () => {
    const httpError = new HTTPError(
      new Response(),
      new Request("https://api.example.com"),
      {} as never
    );
    Object.assign(httpError, {
      response: { json: () => Promise.resolve({ detail: "Email is already registered" }) }
    });
    mockJsonFn.mockRejectedValueOnce(httpError);

    await expect(
      registerToAPI({ name: "Test", username: "test", email: "test@test.com", password: "pass123" })
    ).rejects.toThrow("Email is already registered");
  });
});
