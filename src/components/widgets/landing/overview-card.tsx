"use client";

import { Activity, Layers, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard, MetaItem, StatusBadge } from "@/ui";

export function OverviewCard() {
  const t = useTranslations("Landing.overview");

  return (
    <BentoCard className="flex flex-col bg-bento-beige p-8 lg:p-12">
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-bento-teal-from to-bento-teal-to"
        aria-hidden="true"
      />

      {/* Radial glow at top-right */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-bento-teal-from/12),_transparent)]"
        aria-hidden="true"
      />

      {/* Dot grid texture — sits on top of glow, below content */}
      <div className="absolute inset-0 pointer-events-none dot-grid-beige" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <StatusBadge
          pulse
          className="border border-bento-beige-accent/20 bg-bento-beige-accent/10 text-bento-beige-accent animate-entrance"
        >
          {t("badge")}
        </StatusBadge>

        <h1 className="mt-8 font-serif text-4xl leading-[1.1] font-bold italic tier-origin-shimmer lg:text-[52px] whitespace-nowrap">
          {t("title")}
        </h1>

        <p className="mt-5 max-w-[520px] text-base leading-relaxed text-bento-beige-muted animate-entrance delay-400">
          {t("description")}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-6 pt-10">
        <MetaItem
          icon={<Activity className="size-3.5 text-bento-beige-accent/50" />}
          label={t("statusLabel")}
          value={t("statusValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
          className="animate-entrance delay-600"
        />
        <div className="h-8 w-px bg-bento-beige-accent/15" aria-hidden="true" />
        <MetaItem
          icon={<Users className="size-3.5 text-bento-beige-accent/50" />}
          label={t("crewsLabel")}
          value={t("crewsValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
          className="animate-entrance delay-800"
        />
        <div className="h-8 w-px bg-bento-beige-accent/15" aria-hidden="true" />
        <MetaItem
          icon={<Layers className="size-3.5 text-bento-beige-accent/50" />}
          label={t("stackLabel")}
          value={t("stackValue")}
          labelClassName="text-bento-beige-subtle"
          valueClassName="text-bento-beige-muted"
          className="animate-entrance delay-1000"
        />
      </div>
    </BentoCard>
  );
}
