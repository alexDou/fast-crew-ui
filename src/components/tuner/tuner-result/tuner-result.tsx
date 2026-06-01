"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { POEM_SOURCE_STATUS } from "@/constants/status";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

import { TunerQuestionForm } from "@/components/tuner/tuner-question-form";
import { submitAnswersAction } from "@/server/actions/tuner";

interface TunerResultPropsType {
  sourceId: number;
}

export function TunerResult({ sourceId }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { status, questions, poetCandidates, message, isRetryExhausted, refetch } =
    useProcessingStatusFetch(sourceId);

  const { poem, isError: resultError } = useResultFetch({
    sourceId,
    status,
    poetCandidates
  });

  if (status === POEM_SOURCE_STATUS.PROCESSING || status === POEM_SOURCE_STATUS.GENERATING) {
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

  if (status === POEM_SOURCE_STATUS.ERROR) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="font-bold text-red-500 text-xl">{t("error.errorFromAPI")}</h2>
        <p className="mt-4 text-muted-foreground text-red-800">
          {message || t("error.errorFromAPIMessage")}
        </p>
      </div>
    );
  }

  if (status === POEM_SOURCE_STATUS.STAGE_1) {
    return (
      <div className="container flex w-full max-w-3xl flex-col gap-8 py-8">
        <TunerQuestionForm
          questions={questions}
          poetCandidates={poetCandidates}
          isSubmitting={isSubmitting}
          onSubmit={async ({ poetId, answers }) => {
            setIsSubmitting(true);
            try {
              const result = await submitAnswersAction(sourceId, {
                poet_id: poetId,
                answers
              });

              if (!result.success) {
                toast.error(t("error.actionErrorTitle"), {
                  description: result.error || t("error.actionErrorMessage")
                });
                return;
              }

              refetch();
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </div>
    );
  }

  if (status === POEM_SOURCE_STATUS.COMPLETE && poem) {
    const styleLabel =
      poem.poet_id !== null && poem.poet_name
        ? `${t("result.styleOfPrefix")} ${poem.poet_name}`
        : t("result.freestyle");

    return (
      <div className="container flex w-full max-w-3xl flex-col items-center py-16">
        <h2 className="mb-2 font-bold text-2xl">{t("result.success.title")}</h2>
        <p className="mb-6 text-muted-foreground">{styleLabel}</p>
        <div className="w-full rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg">{poem.poem}</pre>
        </div>
      </div>
    );
  }

  return null;
}
