import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPost, mockCookies } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockCookies: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

vi.mock("ky", () => ({
  default: {
    post: mockPost
  },
  HTTPError: class HTTPError extends Error {}
}));

import { submitAnswersAction } from "../tuner";

describe("submitAnswersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({
      get: () => ({ value: "token" })
    });
    mockPost.mockReturnValue({
      json: vi.fn().mockResolvedValue({
        message: "Answers accepted",
        status: "generating",
        poem_source_id: 7
      })
    });
  });

  it("forwards poet_id in the request body", async () => {
    await submitAnswersAction(7, {
      poet_id: 11,
      answers: { q1: "Hopeful" }
    });

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/poem-source/7/answers"),
      expect.objectContaining({
        json: {
          answers: { q1: "Hopeful" },
          poet_id: 11
        }
      })
    );
  });
});
