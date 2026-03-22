"use client";

import { Palette, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { routesBook } from "@/lib/routes-book";

import { Link } from "@/i18n/navigation";
import type { APIUser } from "@/server/api/auth";

interface DashboardProps {
  user: APIUser;
}

export function Dashboard({ user }: DashboardProps) {
  const t = useTranslations("Dashboard");

  return (
    <section>
      <p className="mb-8 text-sm text-bento-beige-muted">
        {user.name} &middot; @{user.username}
      </p>

      {/* Crew tiles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Poets Crew tile */}
        <div className="flex flex-col justify-between border border-bento-beige-accent/15 bg-bento-beige p-6 shadow-sm">
          <div>
            <div className="mb-3 flex size-10 items-center justify-center border border-bento-beige-accent/20 bg-bento-beige-accent/8">
              <Palette className="size-5 text-bento-beige-accent" />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-bento-beige-text">
              {t("crewTitle")}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-bento-beige-muted">
              {t("crewDescription")}
            </p>
          </div>
          <div className="mt-5 flex items-center gap-4 border-t border-bento-beige-accent/10 pt-4">
            <Link
              href={routesBook.tuner}
              className="flex items-center gap-1.5 text-sm font-medium text-bento-beige-accent underline-offset-4 hover:underline"
            >
              <Palette className="size-3.5" />
              {t("tunerLink")}
            </Link>
            <Link
              href={routesBook.poems}
              className="flex items-center gap-1.5 text-sm font-medium text-bento-beige-accent underline-offset-4 hover:underline"
            >
              <BookOpen className="size-3.5" />
              {t("poemsLink")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
