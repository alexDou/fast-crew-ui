"use client";

import { useTranslations } from "next-intl";

import { PROCESSING_STATUS } from "@/constants/status";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { PoemDisplay } from "@/widgets";

interface TunerResultPropsType {
  sourceId: number;
}

export function TunerResult({ sourceId }: TunerResultPropsType) {
  const t = useTranslations("Tuner");

  const { status, isRetryExhausted } = useProcessingStatusFetch(sourceId);
  const { poems, isError: resultError } = useResultFetch({
    sourceId,
    status
  });

  if (status === PROCESSING_STATUS.PROCESSING) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="font-bold text-xl">{t("result.processing.title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("result.processing.message")}</p>
      </div>
    );
  }

  if (isRetryExhausted || resultError) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="font-bold text-red-500 text-xl">{t("error.retryExhaustedTitle")}</h2>
        <p className="mt-4 text-muted-foreground text-red-800">
          {t("error.retryExhaustedMessage")}
        </p>
      </div>
    );
  }

  if (status === PROCESSING_STATUS.ERROR) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="font-bold text-red-500 text-xl">{t("error.errorFromAPI")}</h2>
        <p className="mt-4 text-muted-foreground text-red-800">{t("error.errorFromAPIMessage")}</p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center py-16">
      <h2 className="mb-6 font-bold text-2xl">{t("result.success.title")}</h2>
      <PoemDisplay poems={poems} />
    </div>
  );
}
