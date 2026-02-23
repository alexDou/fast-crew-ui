import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { routesBook } from "@/lib/routes-book";

import { PoemDisplay } from "@/widgets";
import { getPoemsBySourceId } from "@/server/api/poem-sources";

export default async function PoemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("PoemDetail");

  let poems;
  try {
    poems = await getPoemsBySourceId(id);
  } catch {
    return (
      <section className="container flex flex-col items-center justify-center py-16">
        <h1 className="font-bold text-2xl text-red-500">{t("errorTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("errorMessage")}</p>
        <Link
          href={routesBook.poems}
          className="mt-6 flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </section>
    );
  }

  if (poems.length === 0) {
    return (
      <section className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 font-bold text-2xl">{t("notFoundTitle")}</h1>
        <p className="mb-6 text-muted-foreground">{t("notFoundMessage")}</p>
        <Link
          href={routesBook.poems}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <Link
        href={routesBook.poems}
        className="mb-8 flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToList")}
      </Link>
      <h1 className="mb-8 font-bold text-2xl">{t("title")}</h1>
      <PoemDisplay poems={poems} />
    </section>
  );
}
