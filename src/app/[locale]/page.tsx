"use client"

import { Balancer } from "react-wrap-balancer";
import Link from 'next/link'

import { useTranslations } from "next-intl";

import { routesPublic} from "@/lib/routes-book";

export default function Home() {
  const t = useTranslations();
  
  return (
    <div className="container py-16">
      <section className="flex flex-col items-center justify-center gap-6 pb-10">
        <Balancer
          as="h1"
          className="text-center text-2xl font-bold text-black lg:text-5xl dark:text-white"
        >
          {t("Dashboard.title")}
        </Balancer>

        <Balancer as="p" className="max-w-3xl px-3 text-center text-base">
          {t("Dashboard.description")}
        </Balancer>
      </section>
      <section className="flex gap-4 items-center justify-center pb-40">
        <Link href={routesPublic.signin} className="border-1 border-grey-100 rounded-sm bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-200 px-4 py-2 dark:text-black">
          {t('Auth.signin')}
        </Link>
        <Link href={routesPublic.signup} className="border-1 border-grey-100 rounded-sm bg-gradient-to-b from-gray-50 hover:from-gray-50 hover:to-gray-200 to-gray-100 px-4 py-2 dark:text-black">
          {t('Auth.signup')}
        </Link>
      </section>
    </div>
  );
}
