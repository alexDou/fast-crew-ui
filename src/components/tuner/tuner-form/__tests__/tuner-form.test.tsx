import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/en/tuner",
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("@/hooks", () => ({
  useSourceCreate: () => ({
    sourceCreate: vi.fn(),
    processing: "idle",
    sourceId: null
  })
}));

import { TunerForm } from "../tuner-form";

describe("TunerForm", () => {
  it("renders the upload submit label", () => {
    render(<TunerForm />);
    expect(screen.getByRole("button", { name: "form.uploadSubmit" })).toBeInTheDocument();
  });
});
