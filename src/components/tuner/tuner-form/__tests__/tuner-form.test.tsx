import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: Record<string, unknown>) => ({ values, errors: {} })
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  )
}));

vi.mock("react-wrap-balancer", () => ({
  Balancer: ({ children }: { children: React.ReactNode }) => <span>{children}</span>
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
  FormField: ({
    render,
    name
  }: {
    render: (args: {
      field: {
        onChange: (v: unknown) => void;
        value: unknown;
        name: string;
        onBlur: () => void;
        ref: (el: unknown) => void;
      };
    }) => React.ReactNode;
    name: string;
    control: unknown;
  }) =>
    render({
      field: {
        onChange: vi.fn(),
        value: undefined,
        name,
        onBlur: vi.fn(),
        ref: vi.fn()
      }
    }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <label {...props}>{children}</label>
  ),
  FormMessage: () => <span />,
  Input: (props: Record<string, unknown>) => <input {...props} />
}));

import { TunerForm } from "../tuner-form";

const mockFileReaderInstance = {
  readAsDataURL: vi.fn(),
  result: "data:image/jpeg;base64,test",
  onloadend: null as (() => void) | null
};

class MockFileReader {
  readAsDataURL = mockFileReaderInstance.readAsDataURL;
  result = mockFileReaderInstance.result;
  onloadend: (() => void) | null = null;

  constructor() {
    mockFileReaderInstance.onloadend = null;
    // Proxy onloadend so we can trigger it from tests
    Object.defineProperty(this, "onloadend", {
      set: (fn: (() => void) | null) => {
        mockFileReaderInstance.onloadend = fn;
      },
      get: () => mockFileReaderInstance.onloadend
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  mockProcessing.current = "idle";
  mockSourceId.current = null;
  mockFileReaderInstance.onloadend = null;
  vi.stubGlobal("FileReader", MockFileReader);
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

  it("shows image preview after file selection", async () => {
    const { container } = render(<TunerForm />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await act(async () => {
      mockFileReaderInstance.onloadend?.();
    });

    const previewImg = container.querySelector('img[alt="Preview"]');
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute("src", "data:image/jpeg;base64,test");
  });

  it("calls sourceCreate on form submission", async () => {
    mockSourceCreate.mockResolvedValue(undefined);

    render(<TunerForm />);

    const user = userEvent.setup();
    await user.click(screen.getByText("form.submit"));

    await waitFor(() => {
      expect(mockSourceCreate).toHaveBeenCalledTimes(1);
    });
  });
});
