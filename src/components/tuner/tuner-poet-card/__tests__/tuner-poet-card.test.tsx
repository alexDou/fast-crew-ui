import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

import { TunerPoetCard } from "../TunerPoetCard";

const samplePoet = {
  id: 11,
  name: "Walt Whitman",
  era: "19th century",
  known_for: "Free verse",
  style_markers: ["long line", "catalog imagery"]
};

describe("TunerPoetCard", () => {
  it("renders all poet fields in the poet variant", () => {
    render(
      <TunerPoetCard
        variant="poet"
        poet={samplePoet}
        name="poet-radio"
        checked={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Walt Whitman")).toBeInTheDocument();
    expect(screen.getByText("19th century")).toBeInTheDocument();
    expect(screen.getByText("Free verse")).toBeInTheDocument();
    expect(screen.getByText("long line")).toBeInTheDocument();
    expect(screen.getByText("catalog imagery")).toBeInTheDocument();
  });

  it("renders only the freestyle copy in the freestyle variant", () => {
    render(
      <TunerPoetCard variant="freestyle" name="poet-radio" checked={true} onChange={vi.fn()} />
    );

    expect(screen.getByText("poetCards.freestyle.title")).toBeInTheDocument();
    expect(screen.getByText("poetCards.freestyle.description")).toBeInTheDocument();
    expect(screen.queryByText("Walt Whitman")).not.toBeInTheDocument();
  });

  it("reflects the checked prop on the underlying radio input", () => {
    const { rerender } = render(
      <TunerPoetCard
        variant="poet"
        poet={samplePoet}
        name="poet-radio"
        checked={false}
        onChange={vi.fn()}
      />
    );

    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(false);

    rerender(
      <TunerPoetCard
        variant="poet"
        poet={samplePoet}
        name="poet-radio"
        checked={true}
        onChange={vi.fn()}
      />
    );

    expect((screen.getByRole("radio") as HTMLInputElement).checked).toBe(true);
  });
});
