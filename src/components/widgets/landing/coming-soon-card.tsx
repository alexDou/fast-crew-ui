"use client";

import { Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard, StatusBadge } from "@/ui";

export function ComingSoonCard() {
  const t = useTranslations("Landing.comingSoon");

  return (
    <BentoCard className="relative flex flex-col items-center justify-center bg-gradient-to-br from-bento-dark via-bento-dark-lighter to-bento-dark px-10 py-12 text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-bento-beige-accent/10),_transparent)] animate-glow-pulse"
        aria-hidden="true"
      />

      {/* Decorative arcs */}
      <svg
        className="absolute inset-0 pointer-events-none size-full"
        viewBox="0 0 400 300"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="200" cy="150" r="140" stroke="rgba(240,233,204,0.04)" strokeWidth="1" />
        <circle cx="200" cy="150" r="100" stroke="rgba(240,233,204,0.06)" strokeWidth="1" />
        <circle cx="200" cy="150" r="60" stroke="rgba(240,233,204,0.08)" strokeWidth="1" />
      </svg>

      {/* Noise texture — sits on top of glow and arcs, below content */}
      <div className="absolute inset-0 pointer-events-none noise-dark" aria-hidden="true" />
      <StatusBadge className="relative border border-bento-beige/20 bg-bento-beige/8 text-bento-beige/70 animate-entrance">
        <Sparkles className="size-3" />
        {t("badge")}
      </StatusBadge>

      <div className="relative mt-5 mb-4 flex size-12 items-center justify-center rounded-[14px] border border-bento-beige/20 bg-bento-beige/8 animate-entrance delay-200">
        <Clock className="size-[22px] text-bento-beige/50 animate-float-fast" />
      </div>

      <h3 className="relative font-serif text-[22px] font-semibold italic text-bento-dark-text animate-entrance delay-300">
        {t("title")}
      </h3>

      <p className="relative mt-2 text-[13px] text-bento-dark-subtle animate-entrance delay-400">
        {t("subtitle")}
      </p>
    </BentoCard>
  );
}
