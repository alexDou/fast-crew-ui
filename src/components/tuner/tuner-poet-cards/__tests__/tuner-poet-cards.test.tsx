import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

import { TunerPoetCards } from "../TunerPoetCards";

const candidates = [
  {
    id: 11,
    name: "Walt Whitman",
    era: "19th century",
    known_for: "Free verse",
    style_markers: ["long line"]
  },
  {
    id: 12,
    name: "Emily Dickinson",
    era: "19th century",
    known_for: "Slant rhyme",
    style_markers: ["dashes"]
  }
];

describe("TunerPoetCards", () => {
  it("renders one card per candidate plus the freestyle card", () => {
    render(<TunerPoetCards candidates={candidates} value={null} onChange={vi.fn()} />);

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(candidates.length + 1);
    expect(screen.getByText("Walt Whitman")).toBeInTheDocument();
    expect(screen.getByText("Emily Dickinson")).toBeInTheDocument();
    expect(screen.getByText("poetCards.freestyle.title")).toBeInTheDocument();
  });

  it("renders only the freestyle card when no candidates are provided", () => {
    render(<TunerPoetCards candidates={[]} value={null} onChange={vi.fn()} />);

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(screen.getByText("poetCards.freestyle.title")).toBeInTheDocument();
  });

  it("calls onChange with the poet id when a poet card is clicked", async () => {
    const onChange = vi.fn();
    render(<TunerPoetCards candidates={candidates} value={null} onChange={onChange} />);

    const user = userEvent.setup();
    const whitman = screen.getAllByRole("radio").find((el) => el.getAttribute("value") === "11");
    expect(whitman).toBeDefined();
    await user.click(whitman!);

    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("calls onChange with null when the freestyle card is clicked", async () => {
    const onChange = vi.fn();
    render(<TunerPoetCards candidates={candidates} value={11} onChange={onChange} />);

    const user = userEvent.setup();
    const freestyle = screen
      .getAllByRole("radio")
      .find((el) => el.getAttribute("value") === "freestyle");
    expect(freestyle).toBeDefined();
    await user.click(freestyle!);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("checks the radio that matches the controlled value", () => {
    render(<TunerPoetCards candidates={candidates} value={12} onChange={vi.fn()} />);

    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    const dickinson = radios.find((el) => el.value === "12")!;
    const whitman = radios.find((el) => el.value === "11")!;
    const freestyle = radios.find((el) => el.value === "freestyle")!;

    expect(dickinson.checked).toBe(true);
    expect(whitman.checked).toBe(false);
    expect(freestyle.checked).toBe(false);
  });
});
