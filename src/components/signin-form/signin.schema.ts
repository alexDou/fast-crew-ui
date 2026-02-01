import { string, z } from "zod";

export function createSigninSchema(t: (key: string) => string) {
  return z.object({
    username: string()
      .min(3, t("usernameMin"))
      .regex(/^[a-zA-Z0-9_]+$/, t("usernameRegex")),
    password: string().min(6, t("passwordMin"))
  });
}

export type SigninFormValuesType = z.infer<ReturnType<typeof createSigninSchema>>;
