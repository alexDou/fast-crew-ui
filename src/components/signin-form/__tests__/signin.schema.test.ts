import { describe, expect, it } from "vitest";

import { createSigninSchema } from "../signin.schema";

const t = (key: string) => key;
const schema = createSigninSchema(t);

describe("signinSchema", () => {
  describe("username", () => {
    it("accepts plain alphanumeric usernames", () => {
      const result = schema.safeParse({ username: "alice42", password: "strongpass" });
      expect(result.success).toBe(true);
    });

    it("accepts usernames with dashes (parity with signup + backend)", () => {
      const result = schema.safeParse({ username: "alice-doe", password: "strongpass" });
      expect(result.success).toBe(true);
    });

    it("accepts usernames with dots, colons, at-signs and underscores", () => {
      const candidates = ["alice.doe", "al:user", "alice@example.com", "alice_doe"];
      for (const username of candidates) {
        expect(schema.safeParse({ username, password: "strongpass" }).success).toBe(true);
      }
    });

    it("trims surrounding whitespace before validating", () => {
      const result = schema.safeParse({ username: "  alice-doe  ", password: "strongpass" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe("alice-doe");
      }
    });

    it("rejects characters that neither signup nor the backend allow", () => {
      const result = schema.safeParse({ username: "alice$doe", password: "strongpass" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("usernameRegex");
      }
    });

    it("rejects usernames shorter than 3 characters", () => {
      const result = schema.safeParse({ username: "al", password: "strongpass" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("usernameMin");
      }
    });
  });

  describe("password", () => {
    it("accepts passwords with at least 8 characters (matches signup + backend)", () => {
      const result = schema.safeParse({ username: "alice", password: "strongpass" });
      expect(result.success).toBe(true);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const result = schema.safeParse({ username: "alice", password: "short" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("passwordMin");
      }
    });
  });
});
