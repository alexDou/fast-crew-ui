"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { PoemType } from "@/types";

interface PoemDisplayPropsType {
  poems: PoemType[];
}

export function PoemDisplay({ poems }: PoemDisplayPropsType) {
  const t = useTranslations("PoemDisplay");

  const criticChoice = poems.find((p) => p.critic_choice);
  const [activePoemId, setActivePoemId] = useState<number>(
    criticChoice ? criticChoice.id : poems[0]?.id
  );

  const activePoem = poems.find((p) => p.id === activePoemId) || null;

  if (poems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      {activePoem && (
        <div className="mb-8 w-full rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg">{activePoem.poem}</pre>
        </div>
      )}

      {poems.length > 1 && (
        <div className="mt-6">
          <h3 className="mb-4 font-semibold text-lg">{t("otherPoems")}</h3>
          <div className="flex gap-2">
            {poems.map((poem, idx) => (
              <button
                key={poem.id}
                onClick={() => setActivePoemId(poem.id)}
                className={`rounded-base px-4 py-2 ${
                  activePoemId === poem.id
                    ? "bg-primary text-white"
                    : "bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium"
                }`}
              >
                {poem.critic_choice ? t("criticChoice") : `${t("alternative")} ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
