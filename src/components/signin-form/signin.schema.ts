import { string, z } from "zod";

// Login accepts either a username or an email, so the allowed character set
// mirrors the signup username regex (and the backend UserBase.username regex),
// which already covers email characters (`@` and `.`).
export function createSigninSchema(t: (key: string) => string) {
  return z.object({
    username: string()
      .trim()
      .min(3, t("usernameMin"))
      .regex(/^[a-zA-Z0-9.:@_-]+$/, t("usernameRegex")),
    password: string().trim().min(8, t("passwordMin"))
  });
}

export type SigninFormValuesType = z.infer<ReturnType<typeof createSigninSchema>>;
