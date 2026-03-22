import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/server/actions/auth", () => ({
  getCurrentUser: mockGetCurrentUser
}));

vi.mock("@/components/error-report", () => ({
  ErrorReport: ({ errorKey }: { errorKey: string }) => (
    <div data-testid="error-report">{errorKey}</div>
  )
}));

vi.mock("@/components/tuner", () => ({
  TunerForm: () => <div data-testid="tuner-form">TunerForm</div>
}));

vi.mock("@/layouts", () => ({
  ContentArea: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="content-area">{children}</section>
  )
}));

import TunerPage from "../page";

describe("TunerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error report when user cannot be loaded", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const page = await TunerPage();
    render(page);

    expect(screen.getByTestId("error-report")).toHaveTextContent("user.network");
  });

  it("renders tuner form in content area when user exists", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: 1,
      name: "Maya",
      username: "maya",
      email: "maya@example.com"
    });

    const page = await TunerPage();
    render(page);

    expect(screen.getByTestId("content-area")).toBeInTheDocument();
    expect(screen.getByTestId("tuner-form")).toBeInTheDocument();
  });
});
