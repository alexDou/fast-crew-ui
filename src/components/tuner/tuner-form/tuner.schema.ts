import { file, number, record, string, z } from "zod";

export function tunerUploadSchema(t: (key: string) => string) {
  return z.object({
    file: file({ message: t("error.fileType") })
      .max(1e6, { message: t("error.fileSize") })
      .mime(["image/gif", "image/jpeg", "image/png", "image/webp"], {
        message: t("error.fileMime")
      }),
    enhance: string()
      .max(100, { message: t("error.enhanceMax") })
      .optional()
  });
}

export type TunerUploadValuesType = z.infer<ReturnType<typeof tunerUploadSchema>>;

export function tunerStage1Schema() {
  return z.object({
    poetId: number().int().positive().nullable(),
    answers: record(string(), string())
  });
}

export type TunerStage1ValuesType = z.infer<ReturnType<typeof tunerStage1Schema>>;

/** @deprecated Use tunerUploadSchema — kept for existing imports. */
export const tunerFormSchema = tunerUploadSchema;

/** @deprecated Use TunerUploadValuesType */
export type TunerFormValuesType = TunerUploadValuesType;
