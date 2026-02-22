import { describe, expect, it, vi } from "vitest";

import { cn, sleep } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "py-1")).toBe("px-2");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("px-2", undefined, null)).toBe("px-2");
  });

  it("returns empty string with no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("sleep()", () => {
  it("resolves after the specified delay", async () => {
    vi.useFakeTimers();
    let resolved = false;
    sleep(100).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(100);
    expect(resolved).toBe(true);

    vi.useRealTimers();
  });

  it("returns a promise", () => {
    const result = sleep(0);
    expect(result).toBeInstanceOf(Promise);
  });
});
