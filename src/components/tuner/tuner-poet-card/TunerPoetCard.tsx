"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import type { PoetCardType } from "@/types";

interface TunerPoetCardBasePropsType {
  name: string;
  checked: boolean;
  onChange: () => void;
}

interface TunerPoetCardPoetPropsType extends TunerPoetCardBasePropsType {
  variant: "poet";
  poet: PoetCardType;
}

interface TunerPoetCardFreestylePropsType extends TunerPoetCardBasePropsType {
  variant: "freestyle";
  poet?: never;
}

type TunerPoetCardPropsType = TunerPoetCardPoetPropsType | TunerPoetCardFreestylePropsType;

const cardBaseClass =
  "flex h-full cursor-pointer flex-col gap-3 rounded-xl border bg-bento-beige/70 p-4 text-left shadow-sm backdrop-blur-sm transition-colors";

const cardCheckedClass = "border-bento-beige-text bg-bento-beige ring-2 ring-bento-beige-text/40";

const cardUncheckedClass = "border-bento-beige-accent/30 hover:border-bento-beige-accent";

const focusRingClass = "focus-within:ring-2 focus-within:ring-bento-beige-text/60";

export function TunerPoetCard(props: TunerPoetCardPropsType) {
  const t = useTranslations("Tuner");

  const valueAttr = props.variant === "poet" ? String(props.poet.id) : "freestyle";

  return (
    <label
      className={cn(
        cardBaseClass,
        focusRingClass,
        props.checked ? cardCheckedClass : cardUncheckedClass
      )}
    >
      <input
        type="radio"
        name={props.name}
        value={valueAttr}
        checked={props.checked}
        onChange={props.onChange}
        className="sr-only"
      />
      {props.variant === "poet" ? (
        <>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-bento-beige-text">{props.poet.name}</span>
            <span className="text-bento-beige-muted text-xs uppercase tracking-wide">
              {props.poet.era}
            </span>
          </div>
          <p className="text-bento-beige-text/80 text-sm">{props.poet.known_for}</p>
          {props.poet.style_markers.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {props.poet.style_markers.map((marker) => (
                <li
                  key={marker}
                  className="rounded-full border border-bento-beige-accent/40 bg-bento-beige px-2 py-0.5 text-bento-beige-text/80 text-xs"
                >
                  {marker}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base text-bento-beige-text">
            {t("poetCards.freestyle.title")}
          </span>
          <p className="text-bento-beige-text/80 text-sm">{t("poetCards.freestyle.description")}</p>
        </div>
      )}
    </label>
  );
}
