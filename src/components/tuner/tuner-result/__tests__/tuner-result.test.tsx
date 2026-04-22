import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn()
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn()
  }
}));

const { mockProcessingStatus, mockResultFetch, mockResumePolling, mockSubmitAnswers } = vi.hoisted(
  () => ({
    mockProcessingStatus: vi.fn(),
    mockResultFetch: vi.fn(),
    mockResumePolling: vi.fn(),
    mockSubmitAnswers: vi.fn()
  })
);

vi.mock("@/hooks", () => ({
  useProcessingStatusFetch: mockProcessingStatus,
  useResultFetch: mockResultFetch
}));

vi.mock("@/server/actions/tuner", () => ({
  submitAnswersAction: mockSubmitAnswers
}));

vi.mock("@/widgets", () => ({
  PoemDisplay: ({
    title,
    poems
  }: {
    title: string;
    poems: Array<{ id: number; poem: string; author_label?: string | null }>;
  }) => (
    <div data-testid="poem-display">
      <h1>{title}</h1>
      <ul>
        {poems.map((poem) => (
          <li key={poem.id} data-label={poem.author_label ?? null}>
            {poem.poem}
          </li>
        ))}
      </ul>
    </div>
  )
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

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TunerResult } from "../tuner-result";

beforeEach(() => {
  vi.clearAllMocks();
  mockResultFetch.mockReturnValue({ poems: [], isError: false });
  mockResumePolling.mockReset();
  mockSubmitAnswers.mockReset();
});

describe("TunerResult", () => {
  const onReset = vi.fn();

  it("renders processing state", () => {
    mockProcessingStatus.mockReturnValue({
      status: "processing",
      isRetryExhausted: false
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("workflow.processing.message")).toBeInTheDocument();
  });

  it("renders stage_1 through the workflow controller", () => {
    mockProcessingStatus.mockReturnValue({
      status: "stage_1",
      questions: [{ id: "q1", text: "What memory does this image wake up?" }],
      isRetryExhausted: false,
      resumePolling: mockResumePolling
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("workflow.stage1.title")).toBeInTheDocument();
    expect(screen.getByText("What memory does this image wake up?")).toBeInTheDocument();
  });

  it("submits stage_1 answers and resumes polling on success", async () => {
    mockProcessingStatus.mockReturnValue({
      status: "stage_1",
      questions: [{ id: "q1", text: "What memory does this image wake up?" }],
      isRetryExhausted: false,
      resumePolling: mockResumePolling
    });
    mockSubmitAnswers.mockResolvedValue({
      success: true,
      data: { message: "Answers accepted", status: "generating", poem_source_id: 42 }
    });

    render(<TunerResult sourceId={42} onReset={onReset} />);

    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), "A summer evening by the sea");
    await user.click(screen.getByText("workflow.stage1.submit"));

    await waitFor(() => {
      expect(mockSubmitAnswers).toHaveBeenCalledWith(42, {
        q1: "A summer evening by the sea"
      });
    });
    await waitFor(() => {
      expect(mockResumePolling).toHaveBeenCalledTimes(1);
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows an error toast and keeps the form when answer submission fails", async () => {
    mockProcessingStatus.mockReturnValue({
      status: "stage_1",
      questions: [{ id: "q1", text: "What memory does this image wake up?" }],
      isRetryExhausted: false,
      resumePolling: mockResumePolling
    });
    mockSubmitAnswers.mockResolvedValue({ success: false, error: "boom" });

    render(<TunerResult sourceId={42} onReset={onReset} />);

    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), "something");
    await user.click(screen.getByText("workflow.stage1.submit"));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("error.submitAnswersTitle", {
        description: "error.submitAnswersMessage"
      });
    });
    expect(mockResumePolling).not.toHaveBeenCalled();
  });

  it("renders generating copy from the workflow controller", () => {
    mockProcessingStatus.mockReturnValue({
      status: "generating",
      isRetryExhausted: false
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByTestId("tuner-generating-screen")).toBeInTheDocument();
    expect(screen.getByText("workflow.generating.message")).toBeInTheDocument();
  });

  it("renders poems inline through PoemDisplay on complete", () => {
    mockProcessingStatus.mockReturnValue({
      status: "complete",
      isRetryExhausted: false
    });
    mockResultFetch.mockReturnValue({
      poems: [
        { id: 1, poem: "Modern verse", author_label: "Modern Poet" },
        { id: 2, poem: "Classic verse", author_label: "Classic Poet" }
      ],
      isLoading: false,
      isError: false
    });

    render(<TunerResult sourceId={42} onReset={onReset} />);

    expect(screen.getByTestId("poem-display")).toBeInTheDocument();
    expect(screen.getByText("workflow.complete.title")).toBeInTheDocument();
    expect(screen.getByText("Modern verse")).toBeInTheDocument();
    expect(screen.getByText("Classic verse")).toBeInTheDocument();
  });

  it("shows the generating fallback while poems are still loading on complete", () => {
    mockProcessingStatus.mockReturnValue({
      status: "complete",
      isRetryExhausted: false
    });
    mockResultFetch.mockReturnValue({ poems: [], isLoading: true, isError: false });

    render(<TunerResult sourceId={42} onReset={onReset} />);

    expect(screen.getByText("workflow.generating.message")).toBeInTheDocument();
  });

  it("shows retry exhausted error with try again button", () => {
    mockProcessingStatus.mockReturnValue({
      status: "error",
      isRetryExhausted: true
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("error.retryExhaustedTitle")).toBeInTheDocument();
    expect(screen.getByText("error.retryExhaustedMessage")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("shows API error with try again button", () => {
    mockProcessingStatus.mockReturnValue({
      status: "error",
      isRetryExhausted: false,
      isIndistinctContentFailure: false
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("error.errorFromAPI")).toBeInTheDocument();
    expect(screen.getByText("error.errorFromAPIMessage")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("shows dedicated indistinct content message", () => {
    mockProcessingStatus.mockReturnValue({
      status: "error",
      isRetryExhausted: false,
      isIndistinctContentFailure: true
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("error.indistinctContentTitle")).toBeInTheDocument();
    expect(screen.getByText("error.indistinctContentMessage")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("shows result fetch error with try again button", () => {
    mockProcessingStatus.mockReturnValue({
      status: "complete",
      isRetryExhausted: false
    });
    mockResultFetch.mockReturnValue({ poems: [], isError: true });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("error.retryExhaustedTitle")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("calls onReset when try again button is clicked", async () => {
    mockProcessingStatus.mockReturnValue({
      status: "error",
      isRetryExhausted: true
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    const user = userEvent.setup();
    await user.click(screen.getByText("error.tryAgain"));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
