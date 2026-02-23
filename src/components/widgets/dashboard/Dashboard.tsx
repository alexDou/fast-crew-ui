"use client";

import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";
import { Balancer } from "react-wrap-balancer";

import { routesBook } from "@/lib/routes-book";

import { Button } from "@/ui";
import type { APIUser } from "@/server/api/auth";

interface DashboardProps {
  user: APIUser;
}

export function Dashboard({ user }: DashboardProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  const handleMoveToTuner = () => router.push(routesBook.tuner);
  const handleMoveToPoems = () => router.push(routesBook.poems);

  return (
    <section className="container py-16">
      <div className="flex flex-col items-center justify-center gap-6 pb-10">
        <Balancer
          as="h1"
          className="text-center font-bold text-2xl text-black lg:text-5xl dark:text-white"
        >
          {t("title")}
        </Balancer>

        <Balancer as="p" className="max-w-3xl px-3 text-center text-base">
          Welcome, {user.name} (@{user.username})
        </Balancer>
      </div>
      <div className="flex items-center justify-center gap-4 pb-10">
        <Button size="lg" onClick={handleMoveToTuner}>
          {t("tunerButton")}
        </Button>
        <Button size="lg" variant="outline" onClick={handleMoveToPoems}>
          {t("poemsButton")}
        </Button>
      </div>
    </section>
  );
}
