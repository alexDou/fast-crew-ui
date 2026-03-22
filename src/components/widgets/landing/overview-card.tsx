"use client";

import { useTranslations } from "next-intl";

import { BentoCard, MetaItem, StatusBadge } from "@/ui";

export function OverviewCard() {
  const t = useTranslations("Landing.overview");

  return (
    <BentoCard className="flex flex-col bg-bento-beige p-8 lg:p-12">
      <div>
        <StatusBadge
          pulse
          className="border border-bento-beige-accent/20 bg-bento-beige-accent/10 text-bento-beige-accent"
        >
          {t("badge")}
        </StatusBadge>

        <h1 className="mt-8 font-[family-name:var(--font-playfair)] text-4xl leading-[1.1] font-bold text-bento-beige-text lg:text-[52px]">
          {t("title")}
          <br />
          <em className="text-bento-beige-accent">{t("titleAccent")}</em> {t("titleEnd")}
        </h1>

        <p className="mt-5 max-w-[520px] text-base leading-relaxed text-bento-beige-muted">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-8 pt-10">
        <MetaItem
          label={t("statusLabel")}
          value={t("statusValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
        />
        <MetaItem
          label={t("crewsLabel")}
          value={t("crewsValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
        />
        <MetaItem
          label={t("stackLabel")}
          value={t("stackValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
        />
      </div>
    </BentoCard>
  );
}
