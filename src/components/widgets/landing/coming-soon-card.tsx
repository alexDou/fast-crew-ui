"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard } from "@/ui";

export function ComingSoonCard() {
  const t = useTranslations("Landing.comingSoon");

  return (
    <BentoCard className="flex flex-col items-center justify-center bg-gradient-to-br from-bento-dark via-bento-dark-lighter to-bento-dark px-10 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-[14px] border border-bento-beige/20 bg-bento-beige/8">
        <Clock className="size-[22px] text-bento-beige/50" />
      </div>

      <h3 className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold italic text-bento-dark-text">
        {t("title")}
      </h3>

      <p className="mt-2 text-[13px] text-bento-dark-subtle">{t("subtitle")}</p>
    </BentoCard>
  );
}
