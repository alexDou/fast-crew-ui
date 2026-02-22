import { describe, expect, it } from "vitest";

import { routesBook, routesPrivate, routesPublic } from "@/lib/routes-book";

describe("routesBook", () => {
  it("has correct route values", () => {
    expect(routesBook.main).toBe("/");
    expect(routesBook.signin).toBe("/signin");
    expect(routesBook.signup).toBe("/signup");
    expect(routesBook.dashboard).toBe("/dashboard");
    expect(routesBook.tuner).toBe("tuner");
  });

  it("is readonly (const assertion)", () => {
    const keys = Object.keys(routesBook);
    expect(keys).toEqual(["main", "signin", "signup", "dashboard", "tuner"]);
  });
});

describe("routesPublic", () => {
  it("contains only public routes", () => {
    expect(routesPublic).toEqual({
      main: "/",
      signin: "/signin",
      signup: "/signup"
    });
  });

  it("does not contain private routes", () => {
    expect(routesPublic).not.toHaveProperty("dashboard");
    expect(routesPublic).not.toHaveProperty("tuner");
  });
});

describe("routesPrivate", () => {
  it("contains only private routes", () => {
    expect(routesPrivate).toEqual({
      main: "/dashboard",
      tuner: "/tuner"
    });
  });

  it("does not contain public-only routes", () => {
    expect(routesPrivate).not.toHaveProperty("signin");
    expect(routesPrivate).not.toHaveProperty("signup");
  });
});
