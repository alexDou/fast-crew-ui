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

  it("renders poem selector buttons when multiple poems", () => {
    render(<PoemDisplay title="poems list" poems={poems} />);

    expect(screen.getByText("alternative 1")).toBeInTheDocument();
    expect(screen.getByText("alternative 2")).toBeInTheDocument();
    expect(screen.getByText("alternative 3")).toBeInTheDocument();
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
