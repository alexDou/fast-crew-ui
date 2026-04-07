import { file, string, z } from "zod";

export function tunerFormSchema(t: (key: string) => string) {
  const enhancePattern = /^[a-z0-9 :.()&%!?,-]+$/i;

  const optionalEnhanceSchema = string()
    .trim()
    .refine((value) => value === "" || value.length >= 3, {
      message: t("error.enhanceMin")
    })
    .refine((value) => value === "" || value.length <= 100, {
      message: t("error.enhanceMax")
    })
    .refine((value) => value === "" || enhancePattern.test(value), {
      message: t("error.enhanceRegex")
    })
    .transform((value) => (value === "" ? undefined : value))
    .optional();

  return z.object({
    file: file({ message: t("error.fileType") })
      .max(1e6, { message: t("error.fileSize") })
      .mime(["image/gif", "image/jpeg", "image/png", "image/webp"], {
        message: t("error.fileMime")
      }),
    enhance: optionalEnhanceSchema
  });
}

export type TunerFormValuesType = z.infer<ReturnType<typeof tunerFormSchema>>;
