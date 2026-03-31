import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PROCESSING_FAILURE_REASONS } from "@/constants/api";
import { PROCESSING_STATUS, type ProcessingStatusType } from "@/constants/status";
import { env } from "@/env";

import { uploadAction } from "@/server/actions/tuner";

export function useSourceCreate() {
  const [processing, setProcessing] = useState<ProcessingStatusType>(PROCESSING_STATUS.IDLE);
  const [sourceId, setSourceId] = useState<number | null>(null);
  const t = useTranslations("Tuner");

  const sourceCreate = async (data: { file: File; enhance?: string }) => {
    setProcessing(PROCESSING_STATUS.PROCESSING);

    try {
      const result = await uploadAction(data);

      if (!result.success || !result.data) {
        const isIndistinctContentError =
          result.error?.trim().toLowerCase() === PROCESSING_FAILURE_REASONS.INDISTINCT_CONTENT;

        setProcessing(PROCESSING_STATUS.ERROR);
        setSourceId(null);
        toast.error(
          t(isIndistinctContentError ? "error.indistinctContentTitle" : "error.actionErrorTitle"),
          {
            description: t(
              isIndistinctContentError
                ? "error.indistinctContentMessage"
                : "error.actionErrorMessage"
            )
          }
        );
        return;
      }

      setSourceId(result.data.id);
      toast.success(t("form.success.title"), {
        description: t("form.success.message")
      });
    } catch (error) {
      setProcessing(PROCESSING_STATUS.ERROR);
      setSourceId(null);
      toast.error(t("error.actionErrorTitle"), {
        description: t("error.actionErrorMessage")
      });
      if (env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error(error);
      }
    }
  };

  const resetProcessing = () => {
    setProcessing(PROCESSING_STATUS.IDLE);
    setSourceId(null);
  };

  return {
    sourceCreate,
    processing,
    sourceId,
    resetProcessing
  };
}
