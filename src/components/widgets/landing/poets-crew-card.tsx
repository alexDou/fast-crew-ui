"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { routesBook } from "@/lib/routes-book";

import { BentoCard, StatusBadge } from "@/ui";

export function PoetsCrewCard() {
  const t = useTranslations("Landing.poetsCrew");

  return (
    <BentoCard className="relative flex flex-1 flex-col bg-gradient-to-br from-bento-teal-from via-bento-teal-to/80 to-bento-teal-to">
      <Image
        src="/images/feather-wing.jpg"
        alt=""
        fill
        className="object-cover opacity-15"
        aria-hidden="true"
        priority
      />

      <div className="relative z-10 flex flex-1 flex-col justify-end gap-3 p-8 lg:p-10">
        <StatusBadge className="border border-bento-teal-muted/18 bg-bento-teal-muted/12 text-bento-teal-muted">
          <Sparkles className="size-3" />
          {t("badge")}
        </StatusBadge>

        <h2 className="font-[family-name:var(--font-playfair)] text-[32px] leading-[1.15] font-bold text-bento-teal-text">
          {t("title")}
        </h2>

        <p className="max-w-[380px] text-sm leading-relaxed text-bento-teal-muted">
          {t("description")}
        </p>

        <Link
          href={routesBook.tuner}
          className="mt-3 inline-flex w-fit items-center gap-2.5 bg-gradient-to-r from-bento-dark to-bento-dark-lighter px-7 py-3.5 font-[family-name:var(--font-geist-sans)] text-lg font-semibold tracking-wide text-bento-beige shadow-[0_4px_24px_rgba(45,69,71,0.3)] transition-all hover:shadow-[0_6px_32px_rgba(45,69,71,0.4)]"
        >
          {t("cta")}
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </BentoCard>
  );
}
