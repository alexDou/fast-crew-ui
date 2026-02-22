import { expect, test } from "@playwright/test";

test("landing page loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("body")).toBeVisible();
});
