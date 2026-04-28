import { describe, expect, it } from "vitest";

import { tunerFormSchema, tunerStage1Schema } from "../tuner.schema";

const t = (key: string) => key;

describe("tunerFormSchema", () => {
  const file = new File(["test"], "test.png", { type: "image/png" });

  it("allows an empty enhance value", () => {
    const result = tunerFormSchema(t).safeParse({ file, enhance: "   " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enhance).toBeUndefined();
    }
  });

  it("keeps a valid enhance value", () => {
    const result = tunerFormSchema(t).safeParse({
      file,
      enhance: "The child is named Lina"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enhance).toBe("The child is named Lina");
    }
  });
});

describe("tunerStage1Schema", () => {
  it("defaults poetId to null and answers to an empty record", () => {
    const result = tunerStage1Schema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.poetId).toBeNull();
      expect(result.data.answers).toEqual({});
    }
  });

  it("accepts an explicit poetId and partial answers", () => {
    const result = tunerStage1Schema.safeParse({
      answers: { q1: "a memory" },
      poetId: 11
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.poetId).toBe(11);
      expect(result.data.answers).toEqual({ q1: "a memory" });
    }
  });

  it("rejects a non-positive poetId", () => {
    const zero = tunerStage1Schema.safeParse({ poetId: 0 });
    const negative = tunerStage1Schema.safeParse({ poetId: -3 });

    expect(zero.success).toBe(false);
    expect(negative.success).toBe(false);
  });
});
