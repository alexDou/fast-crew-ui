import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  )
}));

const { mockSourceCreate, mockProcessing, mockSourceId, mockResetProcessing } = vi.hoisted(() => ({
  mockSourceCreate: vi.fn(),
  mockProcessing: { current: "idle" as string },
  mockSourceId: { current: null as number | null },
  mockResetProcessing: vi.fn()
}));

vi.mock("@/hooks", () => ({
  useSourceCreate: () => ({
    sourceCreate: mockSourceCreate,
    processing: mockProcessing.current,
    sourceId: mockSourceId.current,
    resetProcessing: mockResetProcessing
  })
}));

vi.mock("@/components/error-report", () => ({
  ErrorReport: ({ errorKey }: { errorKey: string }) => (
    <div data-testid="error-report">{errorKey}</div>
  )
}));

vi.mock("@/components/tuner/tuner-result/tuner-result", () => ({
  TunerResult: ({ sourceId, onReset }: { sourceId: number; onReset: () => void }) => (
    <div data-testid="tuner-result" data-source-id={sourceId}>
      <button data-testid="result-reset" onClick={onReset}>
        Reset
      </button>
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
  ),
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: () => <div data-testid="form-field" />,
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: () => <span />,
  Input: () => <input />
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TunerForm } from "../tuner-form";

beforeEach(() => {
  vi.clearAllMocks();
  mockProcessing.current = "idle";
  mockSourceId.current = null;
});

describe("TunerForm", () => {
  it("renders form in idle state", () => {
    render(<TunerForm />);

    expect(screen.getByText("form.submit")).toBeInTheDocument();
  });

  it("renders TunerResult in processing state with sourceId", () => {
    mockProcessing.current = "processing";
    mockSourceId.current = 42;

    render(<TunerForm />);

    const tunerResult = screen.getByTestId("tuner-result");
    expect(tunerResult).toBeInTheDocument();
    expect(tunerResult).toHaveAttribute("data-source-id", "42");
  });

  it("passes onReset to TunerResult", async () => {
    mockProcessing.current = "processing";
    mockSourceId.current = 42;

    render(<TunerForm />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("result-reset"));

    expect(mockResetProcessing).toHaveBeenCalledTimes(1);
  });

  it("shows error report and try again button in error state", () => {
    mockProcessing.current = "error";

    render(<TunerForm />);

    expect(screen.getByTestId("error-report")).toBeInTheDocument();
    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
  });

  it("calls resetProcessing when try again button is clicked in error state", async () => {
    mockProcessing.current = "error";

    render(<TunerForm />);

    const user = userEvent.setup();
    await user.click(screen.getByText("error.tryAgain"));

    expect(mockResetProcessing).toHaveBeenCalledTimes(1);
  });
});
