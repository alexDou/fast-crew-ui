"use client";

import { useTranslations } from "next-intl";

import { PROCESSING_STATUS } from "@/constants/status";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

interface TunerResultPropsType {
  sourceId: number;
}

export function TunerResult({ sourceId }: TunerResultPropsType) {
  const t = useTranslations("Tuner");

  const { status, isRetryExhausted } = useProcessingStatusFetch(sourceId);
  const {
    poems,
    activePoem,
    setActivePoemId,
    isError: resultError
  } = useResultFetch({
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

      {activePoem && (
        <div className="mb-8 rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg">{activePoem.poem}</pre>
        </div>
      )}

      {poems.length > 1 && (
        <div className="mt-6">
          <h3 className="mb-4 font-semibold text-lg">{t("result.otherPoems")}</h3>
          <div className="flex gap-2">
            {poems.map((poem, idx) => (
              <button
                key={poem.id}
                onClick={() => setActivePoemId(poem.id)}
                className={`rounded-base px-4 py-2 ${
                  activePoem?.id === poem.id
                    ? "bg-primary text-white"
                    : "bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium"
                }`}
              >
                {poem.critic_choice
                  ? t("result.criticChoice")
                  : `${t("result.alternative")} ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
