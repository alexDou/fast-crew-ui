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
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("workflow.stage1.title")).toBeInTheDocument();
    expect(screen.getByText("What memory does this image wake up?")).toBeInTheDocument();
    expect(screen.getByText("What feeling should guide the poem?")).toBeInTheDocument();
  });

  it("submits answers keyed by backend question id", async () => {
    const onSubmit = vi.fn();

    render(
      <TunerQuestionForm
        questions={[
          { id: "q1", text: "What memory does this image wake up?" },
          { id: "q2", text: "What feeling should guide the poem?" }
        ]}
        onSubmit={onSubmit}
      />
    );

    const user = userEvent.setup();
    const textareas = screen.getAllByRole("textbox");

    await user.type(textareas[0], "A summer night by the sea");
    await user.type(textareas[1], "Tender and nostalgic");
    await user.click(screen.getByText("workflow.stage1.submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      q1: "A summer night by the sea",
      q2: "Tender and nostalgic"
    });
  });
});
