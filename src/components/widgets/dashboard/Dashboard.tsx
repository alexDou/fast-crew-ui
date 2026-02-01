"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Balancer } from "react-wrap-balancer";

import type { APIUser } from "@/server/api/auth";
import { routesBook } from "@/lib/routes-book";

import { Button } from "@/ui";


interface DashboardProps {
  user: APIUser;
}

export function Dashboard({ user }: DashboardProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  const handleMoveToTuner = () => router.push(routesBook.tuner);

  return (
    <section className="container py-16">
      <div className="flex flex-col items-center justify-center gap-6 pb-10">
        <Balancer
          as="h1"
          className="text-center text-2xl font-bold text-black lg:text-5xl dark:text-white"
        >
          {t("title")}
        </Balancer>

        <Balancer as="p" className="max-w-3xl px-3 text-center text-base">
          Welcome, {user.name} (@{user.username})
        </Balancer>
      </div>
      <div className="flex items-center justify-center pb-10">
        <Button size="lg" onClick={handleMoveToTuner}>{t("tunerButton")}</Button>
      </div>
    </section>
  );
}
