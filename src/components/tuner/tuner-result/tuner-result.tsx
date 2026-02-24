"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import { PROCESSING_STATUS } from "@/constants/status";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { routesBook } from "@/lib/routes-book";

import { Button } from "@/ui";

interface TunerResultPropsType {
  sourceId: number;
  onReset: () => void;
}

export function TunerResult({ sourceId, onReset }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  const router = useRouter();

  const { status, isRetryExhausted } = useProcessingStatusFetch(sourceId);
  const { isError: resultError } = useResultFetch({
    sourceId,
    status
  });

  useEffect(() => {
    if (status === PROCESSING_STATUS.SUCCESS) {
      router.push(routesBook.poemDetail(sourceId));
    }
  }, [status, sourceId, router]);

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
        <Button variant="outline" className="mt-6" onClick={onReset}>
          {t("error.tryAgain")}
        </Button>
      </div>
    );
  }

  if (status === PROCESSING_STATUS.ERROR) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="font-bold text-red-500 text-xl">{t("error.errorFromAPI")}</h2>
        <p className="mt-4 text-muted-foreground text-red-800">{t("error.errorFromAPIMessage")}</p>
        <Button variant="outline" className="mt-6" onClick={onReset}>
          {t("error.tryAgain")}
        </Button>
      </div>
    );
  }

  return null;
}
