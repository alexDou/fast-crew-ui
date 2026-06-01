import { describe, expect, it } from "vitest";

import { tunerStage1Schema, tunerUploadSchema } from "../tuner.schema";

const t = (key: string) => key;

describe("tunerUploadSchema", () => {
  it("requires an image file", () => {
    const result = tunerUploadSchema(t).safeParse({ enhance: "note" });
    expect(result.success).toBe(false);
  });
});

describe("tunerStage1Schema", () => {
  it("accepts null poetId and empty answers", () => {
    const result = tunerStage1Schema().safeParse({
      poetId: null,
      answers: {}
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.poetId).toBeNull();
    }
  });

  it("accepts a positive poet id", () => {
    const result = tunerStage1Schema().safeParse({
      poetId: 12,
      answers: { q1: "Quiet mood" }
    });

    expect(result.success).toBe(true);
  });
});
