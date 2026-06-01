"use client";

import { useTranslations } from "next-intl";

import { TunerPoetCard } from "@/components/tuner/tuner-poet-card";

import type { PoetCardType } from "@/types";

export interface TunerPoetCardsPropsType {
  candidates: PoetCardType[];
  value: number | null;
  onChange: (poetId: number | null) => void;
}

const RADIO_GROUP_NAME = "tuner-poet-selection";

export function TunerPoetCards({ candidates, value, onChange }: TunerPoetCardsPropsType) {
  const t = useTranslations("Tuner.poetCards");

  return (
    <section className="w-full space-y-4">
      <h2 className="font-semibold text-lg">{t("title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((poet) => (
          <TunerPoetCard
            key={poet.id}
            poet={poet}
            variant="poet"
            name={RADIO_GROUP_NAME}
            checked={value === poet.id}
            onChange={onChange}
          />
        ))}
        <TunerPoetCard
          variant="freestyle"
          name={RADIO_GROUP_NAME}
          checked={value === null}
          onChange={onChange}
        />
      </div>
    </section>
  );
}
