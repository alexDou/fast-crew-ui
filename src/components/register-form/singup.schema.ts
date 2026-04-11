import { email, string, z } from "zod";

export function createSignupSchema(t: (key: string) => string) {
  return z
    .object({
      name: string()
        .trim()
        .min(3, t("nameMin"))
        .regex(/^[a-zA-Z0-9 -]+$/, t("nameRegex")),
      email: email({ message: t("emailInvalid") }),
      username: string()
        .trim()
        .min(3, t("usernameMin"))
        .regex(/^[a-zA-Z0-9.:@_-]+$/, t("usernameRegex")),
      password: string().trim().min(8, t("passwordMin")),
      confirmPassword: string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMatch"),
      path: ["confirmPassword"]
    });
}

export type SignupFormValuesType = z.infer<ReturnType<typeof createSignupSchema>>;
