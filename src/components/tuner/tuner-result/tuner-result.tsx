"use client";

import { useTranslations } from "next-intl";

import { useProcessingStatusFetch, useResultFetch } from "@/hooks";

interface TunerResultPropsType {
  sourceId: number;
}

export function TunerResult({ sourceId }: TunerResultPropsType) {
  const t = useTranslations("Tuner");
  
  const { status, isError: statusError } = useProcessingStatusFetch(sourceId);
  const { poems, activePoem, setActivePoemId } = useResultFetch({ sourceId, status });

  if (status === 'processing') {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-bold">{t("result.processing.title")}</h2>
        <p className="mt-4 text-muted-foreground">
          {t("result.processing.message")}
        </p>
      </div>
    );
  }

  if (statusError || status === 'error') {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-bold text-red-500">{t("error.errorFromAPI")}</h2>
        <p className="mt-4 text-muted-foreground text-red-800">
          {t("error.errorFromAPIMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center py-16">
      <h2 className="text-2xl font-bold mb-6">{t("result.success.title")}</h2>
      
      {activePoem && (
        <div className="mb-8 p-6 bg-neutral-secondary-medium rounded-base">
          <pre className="whitespace-pre-wrap font-serif text-lg">{activePoem.poem}</pre>
        </div>
      )}

      {poems.length > 1 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">{t("result.otherPoems")}</h3>
          <div className="flex gap-2">
            {poems.map((poem, idx) => (
              <button
                key={poem.id}
                onClick={() => setActivePoemId(poem.id)}
                className={`px-4 py-2 rounded-base ${
                  activePoem?.id === poem.id
                    ? 'bg-primary text-white'
                    : 'bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium'
                }`}
              >
                {poem.critic_choice ? t("result.criticChoice") : `${t("result.alternative")} ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
