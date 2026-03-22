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

vi.mock("@/widgets", () => ({
  Dashboard: ({ user }: { user: { name: string } }) => (
    <div data-testid="dashboard">Dashboard: {user.name}</div>
  )
}));

import DashboardPage from "../page";

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error report when user cannot be loaded", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const page = await DashboardPage();
    render(page);

    expect(screen.getByTestId("error-report")).toHaveTextContent("user.network");
  });

  it("renders dashboard when user exists", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: 1,
      name: "Maya",
      username: "maya",
      email: "maya@example.com"
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByTestId("dashboard")).toHaveTextContent("Dashboard: Maya");
  });
});
