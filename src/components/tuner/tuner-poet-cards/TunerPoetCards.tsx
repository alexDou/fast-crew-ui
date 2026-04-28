"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import type { PoetCardType } from "@/types";

import { TunerPoetCard } from "../tuner-poet-card";

interface TunerPoetCardsPropsType {
  candidates: PoetCardType[];
  value: number | null;
  onChange: (value: number | null) => void;
}

export function TunerPoetCards({ candidates, value, onChange }: TunerPoetCardsPropsType) {
  const t = useTranslations("Tuner");
  const groupName = useId();

  return (
    <fieldset className="space-y-4">
      <legend className="font-medium text-bento-beige-text text-sm">{t("poetCards.title")}</legend>
      <div
        role="radiogroup"
        aria-label={t("poetCards.title")}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {candidates.map((poet) => (
          <TunerPoetCard
            key={poet.id}
            variant="poet"
            poet={poet}
            name={groupName}
            checked={value === poet.id}
            onChange={() => onChange(poet.id)}
          />
        ))}
        <TunerPoetCard
          variant="freestyle"
          name={groupName}
          checked={value === null}
          onChange={() => onChange(null)}
        />
      </div>
    </fieldset>
  );
}
