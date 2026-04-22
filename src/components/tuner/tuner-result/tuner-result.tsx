"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { Button } from "@/ui";

import { PROCESSING_STATUS } from "@/constants/status";
import { routesBook } from "@/lib/routes-book";

import { submitAnswersAction } from "@/server/actions/tuner";

import { TunerQuestionForm } from "../tuner-question-form";

interface TunerResultPropsType {
  sourceId: number;
  onReset: () => void;
}

export function TunerResult({ sourceId, onReset }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  const router = useRouter();
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  const { status, questions, isRetryExhausted, isIndistinctContentFailure, resumePolling } =
    useProcessingStatusFetch(sourceId);
  const { isError: resultError } = useResultFetch({
    sourceId,
    status
  });

  useEffect(() => {
    if (status === PROCESSING_STATUS.COMPLETE) {
      router.push(routesBook.poemDetail(sourceId));
    }
  }, [status, sourceId, router]);

  const handleSubmitAnswers = async (answers: Record<string, string>) => {
    setIsSubmittingAnswers(true);
    try {
      const result = await submitAnswersAction(sourceId, answers);
      if (!result.success) {
        toast.error(t("error.submitAnswersTitle"), {
          description: t("error.submitAnswersMessage")
        });
        return;
      }
      await resumePolling();
    } catch {
      toast.error(t("error.submitAnswersTitle"), {
        description: t("error.submitAnswersMessage")
      });
    } finally {
      setIsSubmittingAnswers(false);
    }
  };

  switch (status) {
    case PROCESSING_STATUS.PROCESSING:
      return (
        <div className="container flex flex-col items-center justify-center py-16">
          <p className="font-bold text-xl text-bento-beige-text">
            {t("workflow.processing.message")}
          </p>
        </div>
      );
    case PROCESSING_STATUS.STAGE_1:
      return (
        <TunerQuestionForm
          questions={questions}
          onSubmit={handleSubmitAnswers}
          isSubmitting={isSubmittingAnswers}
        />
      );
    case PROCESSING_STATUS.GENERATING:
      return (
        <div
          className="container flex flex-col items-center justify-center py-16"
          data-testid="tuner-generating-screen"
        >
          <p className="font-bold text-xl text-bento-beige-text">
            {t("workflow.generating.message")}
          </p>
        </div>
      );
    case PROCESSING_STATUS.COMPLETE:
      if (resultError) {
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

      return null;
    case PROCESSING_STATUS.ERROR:
      if (isRetryExhausted) {
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
          <p className="mt-4 text-muted-foreground text-red-800">
            {t("error.errorFromAPIMessage")}
          </p>
          <Button variant="outline" className="mt-6" onClick={onReset}>
            {t("error.tryAgain")}
          </Button>
        </div>
      );
    default:
      return null;
  }
}
