import { Link } from "@/i18n/navigation";

import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { routesBook } from "@/lib/routes-book";

import { ContentArea } from "@/layouts";
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
      <ContentArea className="items-center justify-center">
        <h1 className="font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
          {t("errorTitle")}
        </h1>
        <p className="mt-4 text-bento-teal-muted">{t("errorMessage")}</p>
        <Link
          href={routesBook.poems}
          className="mt-6 flex items-center gap-2 text-bento-teal-text hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </ContentArea>
    );
  }

  if (!poems.length) {
    return (
      <ContentArea className="items-center justify-center">
        <h1 className="mb-4 font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
          {t("notFoundTitle")}
        </h1>
        <p className="mb-6 text-bento-teal-muted">{t("notFoundMessage")}</p>
        <Link
          href={routesBook.poems}
          className="flex items-center gap-2 text-bento-teal-text hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </ContentArea>
    );
  }

  return (
    <ContentArea>
      <Link
        href={routesBook.poems}
        className="mb-8 flex items-center gap-2 text-bento-teal-text hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToList")}
      </Link>
      <PoemDisplay title={t("title")} poems={poems} />
    </ContentArea>
  );
}
