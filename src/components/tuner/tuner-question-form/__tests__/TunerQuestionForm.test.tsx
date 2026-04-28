import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { index?: number }) => {
    if (key === "workflow.stage1.questionLabel" && values?.index) {
      return `${key}.${values.index}`;
    }

    return key;
  }
}));

vi.mock("@/ui", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

import { TunerQuestionForm } from "../TunerQuestionForm";

describe("TunerQuestionForm", () => {
  it("renders backend-provided questions", () => {
    render(
      <TunerQuestionForm
        questions={[
          { id: "q1", text: "What memory does this image wake up?" },
          { id: "q2", text: "What feeling should guide the poem?" }
        ]}
        poetCandidates={[]}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("workflow.stage1.title")).toBeInTheDocument();
    expect(screen.getByText("What memory does this image wake up?")).toBeInTheDocument();
    expect(screen.getByText("What feeling should guide the poem?")).toBeInTheDocument();
  });

  it("submits answers and a null poet id when freestyle is selected", async () => {
    const onSubmit = vi.fn();

    render(
      <TunerQuestionForm
        questions={[
          { id: "q1", text: "What memory does this image wake up?" },
          { id: "q2", text: "What feeling should guide the poem?" }
        ]}
        poetCandidates={[]}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const textareas = screen.getAllByRole("textbox");

    await user.type(textareas[0], "A summer night by the sea");
    await user.type(textareas[1], "Tender and nostalgic");
    await user.click(screen.getByText("form.submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      answers: {
        q1: "A summer night by the sea",
        q2: "Tender and nostalgic"
      },
      poetId: null
    });
  });

  it("forwards the chosen poet id when a poet card is selected", async () => {
    const onSubmit = vi.fn();

    render(
      <TunerQuestionForm
        questions={[]}
        poetCandidates={[
          {
            id: 11,
            name: "Walt Whitman",
            era: "19th century",
            known_for: "Free verse",
            style_markers: ["long line"]
          }
        ]}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const radios = screen.getAllByRole("radio");
    const whitmanRadio = radios.find((r) => r.getAttribute("value") === "11");
    expect(whitmanRadio).toBeDefined();
    await user.click(whitmanRadio!);

    await user.click(screen.getByText("form.submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      answers: {},
      poetId: 11
    });
  });
});
