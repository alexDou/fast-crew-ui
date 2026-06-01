import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PoetCardType } from "@/types";

import { TunerPoetCards } from "../TunerPoetCards";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const candidates: PoetCardType[] = [
  {
    id: 11,
    name: "Walt Whitman",
    era: "19th century",
    known_for: "Free verse",
    style_markers: ["long line"]
  }
];

describe("TunerPoetCards", () => {
  it("updates controlled value when a poet card is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TunerPoetCards candidates={candidates} value={null} onChange={onChange} />);

    await user.click(screen.getByText("Walt Whitman"));
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("renders only freestyle when candidates are empty", () => {
    render(<TunerPoetCards candidates={[]} value={null} onChange={vi.fn()} />);

    expect(screen.getByText("freestyle.title")).toBeInTheDocument();
    expect(screen.queryByText("Walt Whitman")).not.toBeInTheDocument();
  });
});
