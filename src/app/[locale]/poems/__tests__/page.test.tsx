import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetPoemSources = vi.hoisted(() => vi.fn());
const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockGetFormatter = vi.hoisted(() => vi.fn());

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" }
}));

vi.mock("@/server/api/poem-sources", () => ({
  getPoemSources: mockGetPoemSources
}));

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  getFormatter: mockGetFormatter
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}));

vi.mock("@/ui", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  )
}));

import PoemsPage from "../page";

describe("PoemsPage", () => {
  const mockT = (key: string) => key;
  const mockFormatter = {
    dateTime: () => "January 15, 2026, 10:30 AM"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(mockT);
    mockGetFormatter.mockResolvedValue(mockFormatter);
  });

  it("renders poem sources list", async () => {
    mockGetPoemSources.mockResolvedValue([
      { id: 1, media_path: "/img/1.jpg", status: "ready", created_at: "2026-01-15T10:30:00Z" },
      { id: 2, media_path: "/img/2.jpg", status: "ready", created_at: "2026-01-16T14:00:00Z" }
    ]);

    const page = await PoemsPage();
    render(page);

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders empty state with link to tuner", async () => {
    mockGetPoemSources.mockResolvedValue([]);

    const page = await PoemsPage();
    render(page);

    expect(screen.getByText("empty")).toBeInTheDocument();
    expect(screen.getByText("emptyAction")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "tuner");
  });

  it("renders error state when API fails", async () => {
    mockGetPoemSources.mockRejectedValue(new Error("Network error"));

    const page = await PoemsPage();
    render(page);

    expect(screen.getByText("errorTitle")).toBeInTheDocument();
    expect(screen.getByText("errorMessage")).toBeInTheDocument();
  });

  it("renders thumbnails with correct dimensions", async () => {
    mockGetPoemSources.mockResolvedValue([
      { id: 1, media_path: "/img/photo.jpg", status: "ready", created_at: "2026-01-15T10:30:00Z" }
    ]);

    const page = await PoemsPage();
    const { container } = render(page);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "80");
    expect(img).toHaveAttribute("height", "80");
    expect(img).toHaveAttribute("src", "/img/photo.jpg");
  });

  it("links dates to poem detail pages", async () => {
    mockGetPoemSources.mockResolvedValue([
      { id: 42, media_path: "/img/1.jpg", status: "ready", created_at: "2026-01-15T10:30:00Z" }
    ]);

    const page = await PoemsPage();
    render(page);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/poems/42");
  });
});
