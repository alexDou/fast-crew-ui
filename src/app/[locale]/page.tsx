"use client";

import Link from "next/link";

import { useTranslations } from "next-intl";
import { Balancer } from "react-wrap-balancer";

import { routesPublic } from "@/lib/routes-book";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="container py-16">
      <section className="flex flex-col items-center justify-center gap-6 pb-10">
        <Balancer
          as="h1"
          className="text-center font-bold text-2xl text-black lg:text-5xl dark:text-white"
        >
          {t("Dashboard.title")}
        </Balancer>

        <Balancer as="p" className="max-w-3xl px-3 text-center text-base">
          {t("Dashboard.description")}
        </Balancer>
      </section>
      <section className="flex items-center justify-center gap-4 pb-40">
        <Link
          href={routesPublic.signin}
          className="rounded-sm border-1 border-grey-100 bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-2 hover:from-gray-50 hover:to-gray-200 dark:text-black"
        >
          {t("Auth.signin")}
        </Link>
        <Link
          href={routesPublic.signup}
          className="rounded-sm border-1 border-grey-100 bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-2 hover:from-gray-50 hover:to-gray-200 dark:text-black"
        >
          {t("Auth.signup")}
        </Link>
      </section>
    </div>
  );
}
