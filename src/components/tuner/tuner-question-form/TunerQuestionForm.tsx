"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { TunerPoetCards } from "@/components/tuner/tuner-poet-cards";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/ui";

import type { PoemSourceQuestionType, PoetCardType } from "@/types";

import { tunerStage1Schema, type TunerStage1ValuesType } from "../tuner-form/tuner.schema";

export interface TunerQuestionFormPropsType {
  questions: PoemSourceQuestionType[];
  poetCandidates: PoetCardType[];
  defaultPoetId?: number | null;
  defaultAnswers?: Record<string, string>;
  isSubmitting?: boolean;
  onSubmit: (values: { poetId: number | null; answers: Record<string, string> }) => void;
}

export function TunerQuestionForm({
  questions,
  poetCandidates,
  defaultPoetId = null,
  defaultAnswers = {},
  isSubmitting = false,
  onSubmit
}: TunerQuestionFormPropsType) {
  const t = useTranslations("Tuner");
  const questionIds = questions.map((question) => question.id);
  const schema = tunerStage1Schema();
  const [selectedPoetId, setSelectedPoetId] = useState<number | null>(defaultPoetId);

  const form = useForm<TunerStage1ValuesType>({
    resolver: zodResolver(schema),
    defaultValues: {
      poetId: defaultPoetId,
      answers: questionIds.reduce<Record<string, string>>((accumulator, questionId) => {
        accumulator[questionId] = defaultAnswers[questionId] ?? "";
        return accumulator;
      }, {})
    }
  });

  const { control, handleSubmit, setValue } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit({
            poetId: selectedPoetId,
            answers: values.answers
          });
        })}
        className="flex w-full flex-col gap-8"
      >
        <TunerPoetCards
          candidates={poetCandidates}
          value={selectedPoetId}
          onChange={(poetId) => {
            setSelectedPoetId(poetId);
            setValue("poetId", poetId, { shouldDirty: true });
          }}
        />

        {questions.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">{t("questions.title")}</h2>
            {questions.map((question) => (
              <FormField
                key={question.id}
                control={control}
                name={`answers.${question.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{question.text}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </section>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t("form.submit")}
        </Button>
      </form>
    </Form>
  );
}
