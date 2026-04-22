"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/ui";

import type { PoemSourceQuestionType } from "@/types";

interface TunerQuestionFormPropsType {
  questions: PoemSourceQuestionType[];
  onSubmit: (answers: Record<string, string>) => Promise<void> | void;
  isSubmitting?: boolean;
}

function buildInitialAnswers(questions: PoemSourceQuestionType[]) {
  return Object.fromEntries(questions.map((question) => [question.id, ""]));
}

export function TunerQuestionForm({
  questions,
  onSubmit,
  isSubmitting = false
}: TunerQuestionFormPropsType) {
  const t = useTranslations("Tuner");
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    buildInitialAnswers(questions)
  );

  const orderedQuestions = useMemo(() => questions, [questions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(answers);
  };

  return (
    <section className="container py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-2xl border border-bento-beige-accent/30 bg-bento-beige/60 p-8 shadow-sm backdrop-blur-sm">
        <div className="space-y-3 text-center">
          <p className="font-bold text-bento-beige-text text-xl">{t("workflow.stage1.title")}</p>
          <p className="text-bento-beige-muted">{t("workflow.stage1.description")}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {orderedQuestions.map((question, index) => {
            const answerId = `question-${question.id}`;

            return (
              <div key={question.id} className="space-y-3">
                <label
                  htmlFor={answerId}
                  className="block font-medium text-bento-beige-text text-sm"
                >
                  {t("workflow.stage1.questionLabel", { index: index + 1 })}
                </label>
                <p className="text-base text-bento-beige-text">{question.text}</p>
                <textarea
                  id={answerId}
                  value={answers[question.id] ?? ""}
                  onChange={(event) => {
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [question.id]: event.target.value
                    }));
                  }}
                  placeholder={t("workflow.stage1.answerPlaceholder")}
                  className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-3 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
            );
          })}

          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting} className="min-w-56">
              {isSubmitting ? t("workflow.stage1.submitting") : t("workflow.stage1.submit")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
