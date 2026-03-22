import { Link } from "@/i18n/navigation";

import { getFormatter, getTranslations } from "next-intl/server";

import { routesBook } from "@/lib/routes-book";

import { ContentArea } from "@/layouts";
import { getPoemSources } from "@/server/api/poem-sources";

import { Button } from "@/ui";

export default async function PoemsPage() {
  const t = await getTranslations("Poems");
  const formatter = await getFormatter();

  let poemSources;
  try {
    poemSources = await getPoemSources();
  } catch {
    return (
      <ContentArea className="items-center justify-center">
        <h1 className="font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
          {t("errorTitle")}
        </h1>
        <p className="mt-4 text-bento-teal-muted">{t("errorMessage")}</p>
      </ContentArea>
    );
  }

  if (poemSources.length === 0) {
    return (
      <ContentArea className="items-center justify-center">
        <h1 className="mb-4 font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
          {t("title")}
        </h1>
        <p className="mb-6 text-bento-teal-muted">{t("empty")}</p>
        <Link href={routesBook.tuner}>
          <Button className="bg-bento-dark text-bento-beige hover:bg-bento-dark-lighter">
            {t("emptyAction")}
          </Button>
        </Link>
      </ContentArea>
    );
  }

  return (
    <ContentArea>
      <h1 className="mb-8 font-[family-name:var(--font-playfair)] font-bold text-2xl text-bento-teal-text">
        {t("title")}
      </h1>
      <ul className="flex flex-col gap-4">
        {poemSources?.map((source) => (
          <li
            key={source.id}
            className="flex items-center gap-4 border border-bento-teal-muted/15 p-4"
          >
            <figure className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.media_path}
                alt=""
                width={80}
                height={80}
                className="object-cover"
                style={{ width: 80, height: 80 }}
              />
            </figure>
            <Link
              href={routesBook.poemDetail(source.id)}
              className="text-bento-teal-text underline-offset-4 hover:underline"
            >
              {formatter.dateTime(new Date(source.created_at), {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </Link>
          </li>
        ))}
      </ul>
    </ContentArea>
  );
}
