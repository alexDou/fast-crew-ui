import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush })
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const { mockProcessingStatus, mockResultFetch } = vi.hoisted(() => ({
  mockProcessingStatus: vi.fn(),
  mockResultFetch: vi.fn()
}));

vi.mock("@/hooks", () => ({
  useProcessingStatusFetch: mockProcessingStatus,
  useResultFetch: mockResultFetch
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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TunerResult } from "../tuner-result";

beforeEach(() => {
  vi.clearAllMocks();
  mockResultFetch.mockReturnValue({ poems: [], isError: false });
});

describe("TunerResult", () => {
  const onReset = vi.fn();

  it("renders processing state", () => {
    mockProcessingStatus.mockReturnValue({
      status: "processing",
      isRetryExhausted: false
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("result.processing.title")).toBeInTheDocument();
    expect(screen.getByText("result.processing.message")).toBeInTheDocument();
  });

  it("redirects to poem detail page on success", () => {
    mockProcessingStatus.mockReturnValue({
      status: "success",
      isRetryExhausted: false
    });

    render(<TunerResult sourceId={42} onReset={onReset} />);

    expect(mockPush).toHaveBeenCalledWith("/poems/42");
  });

  it("does not render inline content on success", () => {
    mockProcessingStatus.mockReturnValue({
      status: "success",
      isRetryExhausted: false
    });

    const { container } = render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(container.textContent).toBe("");
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
      isRetryExhausted: false
    });

    render(<TunerResult sourceId={1} onReset={onReset} />);

    expect(screen.getByText("error.errorFromAPI")).toBeInTheDocument();
    expect(screen.getByText("error.errorFromAPIMessage")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("shows result fetch error with try again button", () => {
    mockProcessingStatus.mockReturnValue({
      status: "success",
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
