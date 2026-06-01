import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PoemDisplay } from "../PoemDisplay";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

describe("PoemDisplay", () => {
  it("renders a single poem without variant tabs", () => {
    render(<PoemDisplay poems={[{ id: 1, poem: "A single poem", poet_id: null }]} />);

    expect(screen.getByText("A single poem")).toBeInTheDocument();
    expect(screen.queryByText("otherPoems")).not.toBeInTheDocument();
  });

  it("renders first poem when multiple poems exist", () => {
    const poems = [
      { id: 1, poem: "First poem", poet_id: null },
      { id: 2, poem: "Second poem", poet_id: null }
    ];

    render(<PoemDisplay poems={poems} />);

    expect(screen.getByText("First poem")).toBeInTheDocument();
    expect(screen.getByText("otherPoems")).toBeInTheDocument();
  });

  it("switches active poem on tab click", async () => {
    const user = userEvent.setup();
    const poems = [
      { id: 1, poem: "First poem", poet_id: null },
      { id: 2, poem: "Second poem", poet_id: null }
    ];

    render(<PoemDisplay poems={poems} />);

    await user.click(screen.getByRole("button", { name: "alternative 2" }));
    expect(screen.getByText("Second poem")).toBeInTheDocument();
  });
});
