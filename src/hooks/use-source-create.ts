import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { uploadAction } from "@/server/actions/tuner";

type ProcessingStatus = "idle" | "processing" | "error";

export function useSourceCreate() {
  const [processing, setProcessing] = useState<ProcessingStatus>("idle");
  const [sourceId, setSourceId] = useState<number | null>(null);
  const t = useTranslations("Tuner");

  const sourceCreate = async (data: { file: File; enhance?: string }) => {
    setProcessing("processing");

    try {
      const result = await uploadAction(data);

      if (!result.success || !result.data) {
        setProcessing("error");
        setSourceId(null);
        toast.error(t("error.actionErrorTitle"), {
          description: t("error.actionErrorMessage")
        });
        return;
      }

      setSourceId(result.data.id);
      toast.success(t("form.success.title"), {
        description: t("form.success.message")
      });
    } catch (error) {
      setProcessing("error");
      setSourceId(null);
      toast.error(t("error.actionErrorTitle"), {
        description: t("error.actionErrorMessage")
      });
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error(error);
      }
    }
  };

  return {
    sourceCreate,
    processing,
    sourceId
  };
}
