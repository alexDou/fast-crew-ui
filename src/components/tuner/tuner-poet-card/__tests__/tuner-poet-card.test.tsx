import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TunerPoetCard } from "../TunerPoetCard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

const poet = {
  id: 11,
  name: "Walt Whitman",
  era: "19th century",
  known_for: "American free verse",
  style_markers: ["long line", "catalog"]
};

describe("TunerPoetCard", () => {
  it("renders poet metadata in poet variant", () => {
    render(
      <TunerPoetCard
        poet={poet}
        variant="poet"
        name="poet-group"
        checked={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Walt Whitman")).toBeInTheDocument();
    expect(screen.getByText("19th century")).toBeInTheDocument();
    expect(screen.getByText("American free verse")).toBeInTheDocument();
    expect(screen.getByText("long line")).toBeInTheDocument();
  });

  it("renders freestyle copy without poet metadata", () => {
    render(
      <TunerPoetCard variant="freestyle" name="poet-group" checked={false} onChange={vi.fn()} />
    );

    expect(screen.getByText("freestyle.title")).toBeInTheDocument();
    expect(screen.queryByText("Walt Whitman")).not.toBeInTheDocument();
  });

  it("calls onChange with null for freestyle selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TunerPoetCard variant="freestyle" name="poet-group" checked={false} onChange={onChange} />
    );

    await user.click(screen.getByText("freestyle.title"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
