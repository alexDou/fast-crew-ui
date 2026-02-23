import Link from "next/link";

import { getFormatter, getTranslations } from "next-intl/server";

import { routesBook } from "@/lib/routes-book";

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
      <section className="container flex flex-col items-center justify-center py-16">
        <h1 className="font-bold text-2xl text-red-500">{t("errorTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("errorMessage")}</p>
      </section>
    );
  }

  if (poemSources.length === 0) {
    return (
      <section className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 font-bold text-2xl">{t("title")}</h1>
        <p className="mb-6 text-muted-foreground">{t("empty")}</p>
        <Link href={routesBook.tuner}>
          <Button>{t("emptyAction")}</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <h1 className="mb-8 font-bold text-2xl">{t("title")}</h1>
      <ul className="flex flex-col gap-4">
        {poemSources.map((source) => (
          <li
            key={source.id}
            className="flex items-center gap-4 rounded-base border border-default-strong p-4"
          >
            <figure className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.media_path}
                alt=""
                width={80}
                height={80}
                className="rounded-base object-cover"
                style={{ width: 80, height: 80 }}
              />
            </figure>
            <Link
              href={routesBook.poemDetail(source.id)}
              className="text-primary underline-offset-4 hover:underline"
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
    </section>
  );
}
