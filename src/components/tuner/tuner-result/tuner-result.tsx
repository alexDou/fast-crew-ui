"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { PROCESSING_STATUS } from "@/constants/status";

import { Button } from "@/ui";

import { submitAnswersAction } from "@/server/actions/tuner";

import { TunerQuestionForm } from "../tuner-question-form";

interface TunerResultPropsType {
  sourceId: number;
  onReset: () => void;
}

export function TunerResult({ sourceId, onReset }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  const {
    status,
    questions,
    poetCandidates,
    isRetryExhausted,
    isIndistinctContentFailure,
    resumePolling
  } = useProcessingStatusFetch(sourceId);
  const {
    poems,
    isLoading: poemsLoading,
    isError: resultError
  } = useResultFetch({
    sourceId,
    status
  });

  const handleSubmitAnswers = async ({
    answers,
    poetId
  }: {
    answers: Record<string, string>;
    poetId: number | null;
  }) => {
    setIsSubmittingAnswers(true);
    try {
      const result = await submitAnswersAction(sourceId, { answers, poetId });
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
          poetCandidates={poetCandidates}
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
    case PROCESSING_STATUS.COMPLETE: {
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

      if (poemsLoading || poems.length === 0) {
        return (
          <div className="container flex flex-col items-center justify-center py-16">
            <p className="font-bold text-xl text-bento-beige-text">
              {t("workflow.generating.message")}
            </p>
          </div>
        );
      }

      const poem = poems[0];
      const styleLabel =
        poem.poet_id !== null && poem.poet_name?.trim()
          ? `${t("result.styleOfPrefix")} ${poem.poet_name}`
          : t("result.freestyle");

      return (
        <section className="container flex flex-col items-center justify-center gap-6 py-16">
          <h1 className="font-serif font-bold text-2xl text-bento-teal-text">
            {t("workflow.complete.title")}
          </h1>
          <p className="font-medium text-base text-bento-beige-text">{styleLabel}</p>
          <article className="rounded-base bg-neutral-secondary-medium p-6">
            <pre className="whitespace-pre-wrap font-mono text-lg text-bento-teal-text">
              {poem.poem.replace(/\snote:.*$/i, "")}
            </pre>
          </article>
          <Button variant="outline" className="mt-6" onClick={onReset}>
            {t("error.tryAgain")}
          </Button>
        </section>
      );
    }
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
