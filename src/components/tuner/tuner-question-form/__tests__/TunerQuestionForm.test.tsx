import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PoemSourceQuestionType, PoetCardType } from "@/types";

import { TunerQuestionForm } from "../TunerQuestionForm";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const questions: PoemSourceQuestionType[] = [
  { id: "q1", text: "What mood should guide the poem?" }
];

const poetCandidates: PoetCardType[] = [
  {
    id: 11,
    name: "Walt Whitman",
    era: "19th century",
    known_for: "Free verse",
    style_markers: ["long line"]
  }
];

describe("TunerQuestionForm", () => {
  it("submits poet_id and answers", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TunerQuestionForm
        questions={questions}
        poetCandidates={poetCandidates}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByText("Walt Whitman"));
    await user.type(screen.getByLabelText("What mood should guide the poem?"), "Hopeful");
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    expect(onSubmit).toHaveBeenCalledWith({
      poetId: 11,
      answers: { q1: "Hopeful" }
    });
  });

  it("does not reference removed poem kind fields", () => {
    render(
      <TunerQuestionForm questions={questions} poetCandidates={poetCandidates} onSubmit={vi.fn()} />
    );

    expect(screen.queryByText(/classic|modern|mystic/i)).not.toBeInTheDocument();
  });
});
