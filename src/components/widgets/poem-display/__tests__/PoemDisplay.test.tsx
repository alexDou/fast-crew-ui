import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

import { PoemDisplay } from "../PoemDisplay";

describe("PoemDisplay", () => {
  const poems = [
    { id: 1, poem: "Roses are red" },
    { id: 2, poem: "Violets are blue" },
    { id: 3, poem: "Sugar is sweet" }
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

  it("uses backend author_label when available", () => {
    const namedPoems = [
      { id: 1, poem: "Modern verse", variant_key: "poet_modern", author_label: "Modern Poet" },
      { id: 2, poem: "Classic verse", variant_key: "poet_classic", author_label: "Classic Poet" }
    ];

    render(<PoemDisplay title="poems list" poems={namedPoems} />);

    expect(screen.getByText("Modern Poet")).toBeInTheDocument();
    expect(screen.getByText("Classic Poet")).toBeInTheDocument();
    expect(screen.queryByText("alternative 1")).not.toBeInTheDocument();
  });

  it("falls back to variant_key when author_label is missing", () => {
    const variantPoems = [
      { id: 1, poem: "Modern verse", variant_key: "poet_modern" },
      { id: 2, poem: "Mystic verse", variant_key: "poet_mystic" }
    ];

    render(<PoemDisplay title="poems list" poems={variantPoems} />);

    expect(screen.getByText("poet_modern")).toBeInTheDocument();
    expect(screen.getByText("poet_mystic")).toBeInTheDocument();
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
