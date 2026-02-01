import { string, file, z } from "zod";

export function tunerFormSchema(t: (key: string) => string) {
  return z.object({
    file: file({ message: t("error.fileType") })
    .max(1e6, { message: t("error.fileSize") })
    .mime(["image/gif", "image/jpeg", "image/png", "image/webp"], { message: t("error.fileMime") }),
    enhance: string().max(100, { message: t("error.enhanceMax") }).optional(),
  });
}

export type TunerFormValuesType = z.infer<ReturnType<typeof tunerFormSchema>>;
