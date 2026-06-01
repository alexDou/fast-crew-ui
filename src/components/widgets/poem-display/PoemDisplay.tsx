"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { PoemType } from "@/types";

interface PoemDisplayPropsType {
  poems: PoemType[];
}

export function PoemDisplay({ poems }: PoemDisplayPropsType) {
  const t = useTranslations("PoemDisplay");

  const [activePoemId, setActivePoemId] = useState<number>(poems[0]?.id ?? 0);

  const activePoem = poems.find((p) => p.id === activePoemId) || poems[0] || null;

  if (poems.length === 0) {
    return null;
  }

  if (poems.length === 1 && activePoem) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-8 w-full rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg">{activePoem.poem}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {activePoem && (
        <div className="mb-8 w-full rounded-base bg-neutral-secondary-medium p-6">
          <pre className="whitespace-pre-wrap font-serif text-lg">{activePoem.poem}</pre>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-4 font-semibold text-lg">{t("otherPoems")}</h3>
        <div className="flex gap-2">
          {poems.map((poem, idx) => (
            <button
              key={poem.id}
              type="button"
              onClick={() => setActivePoemId(poem.id)}
              className={`rounded-base px-4 py-2 ${
                activePoemId === poem.id
                  ? "bg-primary text-white"
                  : "bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium"
              }`}
            >
              {`${t("alternative")} ${idx + 1}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
