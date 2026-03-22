"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { Button } from "@/ui";

import { PROCESSING_STATUS } from "@/constants/status";
import { routesBook } from "@/lib/routes-book";

interface TunerResultPropsType {
  sourceId: number;
  onReset: () => void;
}

export function TunerResult({ sourceId, onReset }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  const router = useRouter();

  const { status, isRetryExhausted, isIndistinctContentFailure } =
    useProcessingStatusFetch(sourceId);
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
        <h2 className="font-bold text-xl text-bento-beige-text">{t("result.processing.title")}</h2>
        <p className="mt-4 text-bento-beige-muted">{t("result.processing.message")}</p>
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
    if (isIndistinctContentFailure) {
      return (
        <div className="container flex flex-col items-center justify-center py-16">
          <h2 className="font-bold text-red-500 text-xl">{t("error.indistinctContentTitle")}</h2>
          <p className="mt-4 text-muted-foreground text-red-800">
            {t("error.indistinctContentMessage")}
          </p>
          <Button variant="outline" className="mt-6" onClick={onReset}>
            {t("error.tryAgain")}
          </Button>
        </div>
      );
    }

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
