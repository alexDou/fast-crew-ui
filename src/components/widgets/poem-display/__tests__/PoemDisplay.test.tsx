import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

import { PoemDisplay } from "../PoemDisplay";

describe("PoemDisplay", () => {
  const poems = [
    { id: 1, poem: "Roses are red", critic_choice: false },
    { id: 2, poem: "Violets are blue", critic_choice: true },
    { id: 3, poem: "Sugar is sweet", critic_choice: false }
  ];

  it("renders the critic's choice poem as active by default", () => {
    render(<PoemDisplay poems={poems} />);

    expect(screen.getByText("Violets are blue")).toBeInTheDocument();
  });

  it("renders first poem when no critic's choice", () => {
    const noCritic = poems.map((p) => ({ ...p, critic_choice: false }));
    render(<PoemDisplay poems={noCritic} />);

    expect(screen.getByText("Roses are red")).toBeInTheDocument();
  });

  it("renders poem selector buttons when multiple poems", () => {
    render(<PoemDisplay poems={poems} />);

    expect(screen.getByText("criticChoice")).toBeInTheDocument();
    expect(screen.getByText("alternative 1")).toBeInTheDocument();
    expect(screen.getByText("alternative 3")).toBeInTheDocument();
  });

  it("switches active poem on button click", () => {
    render(<PoemDisplay poems={poems} />);

    fireEvent.click(screen.getByText("alternative 1"));
    expect(screen.getByText("Roses are red")).toBeInTheDocument();
  });

  it("does not render selector when single poem", () => {
    render(<PoemDisplay poems={[poems[0]]} />);

    expect(screen.getByText("Roses are red")).toBeInTheDocument();
    expect(screen.queryByText("otherPoems")).not.toBeInTheDocument();
  });

  it("returns null for empty poems array", () => {
    const { container } = render(<PoemDisplay poems={[]} />);

    expect(container.innerHTML).toBe("");
  });
});
