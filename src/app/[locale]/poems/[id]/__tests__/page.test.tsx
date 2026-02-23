import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPoemsBySourceId = vi.hoisted(() => vi.fn());
const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" }
}));

vi.mock("@/server/api/poem-sources", () => ({
  getPoemsBySourceId: mockGetPoemsBySourceId
}));

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left" />
}));

vi.mock("@/widgets", () => ({
  PoemDisplay: ({ poems }: { poems: { id: number }[] }) => (
    <div data-testid="poem-display">Poems: {poems.length}</div>
  )
}));

import PoemDetailPage from "../page";

describe("PoemDetailPage", () => {
  const mockT = (key: string) => key;
  const params = Promise.resolve({ id: "42" });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(mockT);
  });

  it("renders poems with PoemDisplay component", async () => {
    mockGetPoemsBySourceId.mockResolvedValue([
      { id: 1, poem: "A poem", critic_choice: true },
      { id: 2, poem: "Another poem", critic_choice: false }
    ]);

    const page = await PoemDetailPage({ params });
    render(page);

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByTestId("poem-display")).toHaveTextContent("Poems: 2");
  });

  it("renders back link to poems list", async () => {
    mockGetPoemsBySourceId.mockResolvedValue([{ id: 1, poem: "A poem", critic_choice: true }]);

    const page = await PoemDetailPage({ params });
    render(page);

    const backLink = screen.getByText("backToList");
    expect(backLink.closest("a")).toHaveAttribute("href", "/poems");
  });

  it("renders error state when API fails", async () => {
    mockGetPoemsBySourceId.mockRejectedValue(new Error("Network error"));

    const page = await PoemDetailPage({ params });
    render(page);

    expect(screen.getByText("errorTitle")).toBeInTheDocument();
    expect(screen.getByText("errorMessage")).toBeInTheDocument();
  });

  it("renders not-found state for empty poems", async () => {
    mockGetPoemsBySourceId.mockResolvedValue([]);

    const page = await PoemDetailPage({ params });
    render(page);

    expect(screen.getByText("notFoundTitle")).toBeInTheDocument();
    expect(screen.getByText("notFoundMessage")).toBeInTheDocument();
  });

  it("passes source ID to API function", async () => {
    mockGetPoemsBySourceId.mockResolvedValue([]);

    await PoemDetailPage({ params });

    expect(mockGetPoemsBySourceId).toHaveBeenCalledWith("42");
  });
});
