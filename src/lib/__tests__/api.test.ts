import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockJsonFn, mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => {
  const mockJsonFn = vi.fn();
  const mockGet = vi.fn(() => ({ json: mockJsonFn }));
  const mockPost = vi.fn(() => ({ json: mockJsonFn }));
  const mockPut = vi.fn(() => ({ json: mockJsonFn }));
  const mockDelete = vi.fn(() => ({ json: mockJsonFn }));
  return { mockJsonFn, mockGet, mockPost, mockPut, mockDelete };
});

vi.mock("ky", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete
    }))
  }
}));

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" }
}));

import { del, get, post, put } from "@/lib/api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("get()", () => {
  it("calls api.get with the URL and returns parsed JSON", async () => {
    mockJsonFn.mockResolvedValueOnce({ id: 1, name: "test" });

    const result = await get<{ id: number; name: string }>("users/1");

    expect(mockGet).toHaveBeenCalledWith("users/1", undefined);
    expect(result).toEqual({ id: 1, name: "test" });
  });

  it("strips leading slash from URL", async () => {
    mockJsonFn.mockResolvedValueOnce({});

    await get("/users/1");

    expect(mockGet).toHaveBeenCalledWith("users/1", undefined);
  });

  it("passes config options through", async () => {
    mockJsonFn.mockResolvedValueOnce({});
    const signal = new AbortController().signal;

    await get("users", { signal });

    expect(mockGet).toHaveBeenCalledWith("users", { signal });
  });
});

describe("post()", () => {
  it("calls api.post with URL, body as json, and returns parsed JSON", async () => {
    const body = { name: "new user" };
    mockJsonFn.mockResolvedValueOnce({ id: 2, name: "new user" });

    const result = await post<{ id: number; name: string }>("users", body);

    expect(mockPost).toHaveBeenCalledWith("users", { json: body });
    expect(result).toEqual({ id: 2, name: "new user" });
  });

  it("strips leading slash from URL", async () => {
    mockJsonFn.mockResolvedValueOnce({});

    await post("/users", { name: "test" });

    expect(mockPost).toHaveBeenCalledWith("users", { json: { name: "test" } });
  });

  it("handles undefined body", async () => {
    mockJsonFn.mockResolvedValueOnce({});

    await post("users");

    expect(mockPost).toHaveBeenCalledWith("users", { json: undefined });
  });

  it("merges config with body", async () => {
    mockJsonFn.mockResolvedValueOnce({});
    const signal = new AbortController().signal;

    await post("users", { name: "test" }, { signal });

    expect(mockPost).toHaveBeenCalledWith("users", {
      signal,
      json: { name: "test" }
    });
  });
});

describe("put()", () => {
  it("calls api.put with URL, body as json, and returns parsed JSON", async () => {
    const body = { name: "updated" };
    mockJsonFn.mockResolvedValueOnce({ id: 1, name: "updated" });

    const result = await put<{ id: number; name: string }>("users/1", body);

    expect(mockPut).toHaveBeenCalledWith("users/1", { json: body });
    expect(result).toEqual({ id: 1, name: "updated" });
  });

  it("strips leading slash from URL", async () => {
    mockJsonFn.mockResolvedValueOnce({});

    await put("/users/1", { name: "test" });

    expect(mockPut).toHaveBeenCalledWith("users/1", { json: { name: "test" } });
  });
});

describe("del()", () => {
  it("calls api.delete with the URL and returns parsed JSON", async () => {
    mockJsonFn.mockResolvedValueOnce({ success: true });

    const result = await del<{ success: boolean }>("users/1");

    expect(mockDelete).toHaveBeenCalledWith("users/1", undefined);
    expect(result).toEqual({ success: true });
  });

  it("strips leading slash from URL", async () => {
    mockJsonFn.mockResolvedValueOnce({});

    await del("/users/1");

    expect(mockDelete).toHaveBeenCalledWith("users/1", undefined);
  });
});

describe("error handling", () => {
  it("propagates errors from ky", async () => {
    mockJsonFn.mockRejectedValueOnce(new Error("Network error"));

    await expect(get("users")).rejects.toThrow("Network error");
  });

  it("propagates errors from post", async () => {
    mockJsonFn.mockRejectedValueOnce(new Error("Server error"));

    await expect(post("users", {})).rejects.toThrow("Server error");
  });
});
