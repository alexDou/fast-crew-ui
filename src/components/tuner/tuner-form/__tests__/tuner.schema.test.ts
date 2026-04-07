import { describe, expect, it } from "vitest";

import { tunerFormSchema } from "../tuner.schema";

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
