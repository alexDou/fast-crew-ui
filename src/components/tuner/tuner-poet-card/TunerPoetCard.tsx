"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import type { PoetCardType } from "@/types";

export interface TunerPoetCardPropsType {
  poet?: PoetCardType;
  checked: boolean;
  name: string;
  onChange: (poetId: number | null) => void;
  variant: "poet" | "freestyle";
}

export function TunerPoetCard({ poet, checked, name, onChange, variant }: TunerPoetCardPropsType) {
  const t = useTranslations("Tuner.poetCards");
  const inputId = useId();
  const value = variant === "freestyle" ? "freestyle" : String(poet?.id);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-base border p-4 transition-colors",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        checked
          ? "border-primary bg-primary/5"
          : "border-default-strong bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium"
      )}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        className="sr-only"
        onChange={() => onChange(variant === "freestyle" ? null : (poet?.id ?? null))}
      />
      {variant === "freestyle" ? (
        <>
          <span className="font-semibold text-base">{t("freestyle.title")}</span>
          <span className="text-muted-foreground text-sm">{t("freestyle.description")}</span>
        </>
      ) : (
        poet && (
          <>
            <div>
              <span className="font-semibold text-base">{poet.name}</span>
              <span className="mt-1 block text-muted-foreground text-sm">{poet.era}</span>
            </div>
            <p className="text-sm">{poet.known_for}</p>
            <ul className="flex flex-wrap gap-2">
              {poet.style_markers.map((marker) => (
                <li
                  key={marker}
                  className="rounded-full bg-neutral-tertiary-medium px-2 py-0.5 text-xs"
                >
                  {marker}
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </label>
  );
}
