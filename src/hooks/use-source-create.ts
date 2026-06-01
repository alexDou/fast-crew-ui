"use client";

import { useCallback, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { TUNER_UI_STATUS } from "@/constants/status";

import { uploadAction } from "@/server/actions/tuner";

export function useSourceCreate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(() => {
    const existingSourceId = searchParams.get("sourceId");
    return existingSourceId ? "processing" : TUNER_UI_STATUS.IDLE;
  });
  const [sourceId, setSourceId] = useState<number | null>(() => {
    const existingSourceId = searchParams.get("sourceId");
    return existingSourceId ? Number.parseInt(existingSourceId, 10) : null;
  });
  const t = useTranslations("Tuner");

  const setSourceIdInUrl = useCallback(
    (id: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sourceId", String(id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const sourceCreate = async (data: { file: File; enhance?: string }) => {
    setProcessing("processing");

    try {
      const result = await uploadAction(data);

      if (!result.success || !result.data) {
        setProcessing(TUNER_UI_STATUS.ERROR);
        setSourceId(null);
        toast.error(t("error.actionErrorTitle"), {
          description: t("error.actionErrorMessage")
        });
        return;
      }

      setSourceId(result.data.id);
      setSourceIdInUrl(result.data.id);
      toast.success(t("form.success.title"), {
        description: t("form.success.message")
      });
    } catch (error) {
      setProcessing(TUNER_UI_STATUS.ERROR);
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
