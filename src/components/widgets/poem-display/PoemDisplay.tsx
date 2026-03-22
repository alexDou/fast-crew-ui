"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { PoemType } from "@/types";

interface PoemDisplayPropsType {
  title: string;
  poems: PoemType[];
}

export function PoemDisplay({ title, poems }: PoemDisplayPropsType) {
  const t = useTranslations("PoemDisplay");

  const criticChoice = poems.find((p) => p.critic_choice);
  const [activePoemId, setActivePoemId] = useState<number>(
    criticChoice ? criticChoice.id : poems[0]?.id
  );

  if (poems.length === 0) {
    return null;
  }

  const activePoem = poems.find((p) => p.id === activePoemId) || null;

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-8 font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
        {title}
      </h1>
      {activePoem?.poem && (
        <div className="mb-8 rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg text-bento-teal-text">
            {activePoem.poem.replace(/\snote:.*$/i, "")}
          </pre>
        </div>
      )}

      {poems.length > 1 && (
        <div className="mt-6">
          <h3 className="mb-4 font-semibold text-lg text-black">{t("otherPoems")}</h3>
          <div className="flex gap-2">
            {poems.map((poem, idx) => (
              <button
                key={poem.id}
                onClick={() => setActivePoemId(poem.id)}
                className={`rounded-base px-4 py-2 ${
                  activePoemId === poem.id
                    ? "bg-primary-foreground text-white"
                    : "bg-bento-beige hover:bg-neutral-tertiary-medium text-black"
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
