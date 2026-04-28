import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

import { PoemDisplay } from "../PoemDisplay";

describe("PoemDisplay", () => {
  const poems = [
    { id: 1, poem: "Roses are red", poet_id: null },
    { id: 2, poem: "Violets are blue", poet_id: null },
    { id: 3, poem: "Sugar is sweet", poet_id: null }
  ];

  it("renders the first poem as active by default", () => {
    render(<PoemDisplay title="poems list" poems={poems} />);

    expect(screen.getByText("Roses are red")).toBeInTheDocument();
  });

  it("renders fallback selector labels when backend metadata is missing", () => {
    render(<PoemDisplay title="poems list" poems={poems} />);

    expect(screen.getByText("alternative 1")).toBeInTheDocument();
    expect(screen.getByText("alternative 2")).toBeInTheDocument();
    expect(screen.getByText("alternative 3")).toBeInTheDocument();
  });

  it("uses backend poet_name when available", () => {
    const namedPoems = [
      { id: 1, poem: "Whitman verse", poet_id: 11, poet_name: "Walt Whitman" },
      { id: 2, poem: "Dickinson verse", poet_id: 12, poet_name: "Emily Dickinson" }
    ];

    render(<PoemDisplay title="poems list" poems={namedPoems} />);

    expect(screen.getByText("Walt Whitman")).toBeInTheDocument();
    expect(screen.getByText("Emily Dickinson")).toBeInTheDocument();
    expect(screen.queryByText("alternative 1")).not.toBeInTheDocument();
  });

  it("switches active poem on button click", () => {
    render(<PoemDisplay title="poems list" poems={poems} />);

    fireEvent.click(screen.getByText("alternative 2"));
    expect(screen.getByText("Violets are blue")).toBeInTheDocument();
  });

  it("does not render selector when single poem", () => {
    render(<PoemDisplay title="poems list" poems={[poems[0]]} />);

    expect(screen.getByText("Roses are red")).toBeInTheDocument();
    expect(screen.queryByText("otherPoems")).not.toBeInTheDocument();
  });

  it("returns null for empty poems array", () => {
    const { container } = render(<PoemDisplay title="poems list" poems={[]} />);

    expect(container.innerHTML).toBe("");
  });
});
