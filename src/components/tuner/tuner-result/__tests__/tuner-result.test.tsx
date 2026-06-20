import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { POEM_SOURCE_STATUS } from "@/constants/status";

const mockUseProcessingStatusFetch = vi.fn();
const mockUseResultFetch = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("@/hooks", () => ({
  useProcessingStatusFetch: (...args: unknown[]) => mockUseProcessingStatusFetch(...args),
  useResultFetch: (...args: unknown[]) => mockUseResultFetch(...args)
}));

vi.mock("@/server/actions/tuner", () => ({
  submitAnswersAction: vi.fn()
}));

import { TunerResult } from "../tuner-result";

describe("TunerResult", () => {
  it("renders a single poem with poet style label", () => {
    mockUseProcessingStatusFetch.mockReturnValue({
      status: POEM_SOURCE_STATUS.COMPLETE,
      questions: [],
      poetCandidates: [],
      message: null,
      isRetryExhausted: false,
      refetch: vi.fn()
    });
    mockUseResultFetch.mockReturnValue({
      poem: {
        id: 1,
        poem: "line one\nline two\nline three",
        poet_id: 11,
        poet_name: "Emily Dickinson"
      },
      isError: false
    });

    render(<TunerResult sourceId={7} />);

    expect(screen.getByText("result.styleOfPrefix Emily Dickinson")).toBeInTheDocument();
    expect(screen.getByText(/line one/)).toBeInTheDocument();
    expect(screen.queryByText(/classic|modern|mystic/i)).not.toBeInTheDocument();
  });

  it("renders freestyle label when poet_id is null", () => {
    mockUseProcessingStatusFetch.mockReturnValue({
      status: POEM_SOURCE_STATUS.COMPLETE,
      questions: [],
      poetCandidates: [],
      message: null,
      isRetryExhausted: false,
      refetch: vi.fn()
    });
    mockUseResultFetch.mockReturnValue({
      poem: { id: 1, poem: "line one\nline two\nline three", poet_id: null },
      isError: false
    });

    render(<TunerResult sourceId={7} />);

    expect(screen.getByText("result.freestyle")).toBeInTheDocument();
  });

  it("does not render freestyle when a poet_id exists without a hydrated name", () => {
    mockUseProcessingStatusFetch.mockReturnValue({
      status: POEM_SOURCE_STATUS.COMPLETE,
      questions: [],
      poetCandidates: [],
      message: null,
      isRetryExhausted: false,
      refetch: vi.fn()
    });
    mockUseResultFetch.mockReturnValue({
      poem: { id: 1, poem: "line one\nline two\nline three", poet_id: 11 },
      isError: false
    });

    render(<TunerResult sourceId={7} />);

    expect(screen.queryByText("result.freestyle")).not.toBeInTheDocument();
    expect(screen.getByText("result.styleOfPrefix result.selectedPoet")).toBeInTheDocument();
  });
});
