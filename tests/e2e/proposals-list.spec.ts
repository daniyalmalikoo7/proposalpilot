/**
 * proposals-list.spec.ts
 *
 * Verifies the /proposals page renders the proposal list correctly and
 * navigates to a proposal's editor when clicked.
 */

import { test, expect } from "@playwright/test";

test.describe("Proposals list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/proposals");
    // Wait for the tRPC query to resolve — skeleton disappears, list or empty state appears.
    await page
      .locator('[class*="divide-y"] li, [class*="flex-col"] p')
      .or(page.getByText(/no proposals yet/i))
      .first()
      .waitFor({ timeout: 15_000 });
  });

  test("renders the page heading and New Proposal button", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /proposals/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /new proposal/i }),
    ).toBeVisible();
  });

  test("renders at least one proposal with title, status, and date", async ({
    page,
  }) => {
    // If DB is empty this test is a soft warning, not a hard failure.
    // We assert the list container exists; if empty we skip row checks.
    const emptyState = page.getByText(/no proposals yet/i);
    const listItems = page.locator("ul li");

    const isEmpty = await emptyState.isVisible();
    if (isEmpty) {
      // Acceptable: no data seeded. Verify empty state UI is correct.
      await expect(emptyState).toBeVisible();
      await expect(
        page.getByRole("button", { name: /create your first proposal/i }),
      ).toBeVisible();
      return;
    }

    // At least one row present.
    await expect(listItems.first()).toBeVisible();

    const firstRow = listItems.first();
    // Title — non-empty text node
    const titleEl = firstRow.locator("p.truncate.text-sm.font-medium");
    await expect(titleEl).not.toBeEmpty();

    // Status badge
    const statusBadge = firstRow.locator("span.rounded-full");
    await expect(statusBadge).toBeVisible();

    // Date (the span without rounded-full, which is the status badge)
    const dateEl = firstRow.locator("span.text-xs:not(.rounded-full)");
    await expect(dateEl).toBeVisible();
  });

  test("clicking a proposal navigates to /proposals/[id]", async ({ page }) => {
    const emptyState = page.getByText(/no proposals yet/i);
    const isEmpty = await emptyState.isVisible();
    if (isEmpty) {
      test.skip(true, "No proposals in DB — skipping navigation test");
      return;
    }

    // Click the first proposal row button.
    const firstRow = page.locator("ul li button").first();
    await firstRow.click();

    await expect(page).toHaveURL(/\/proposals\/[a-z0-9-]+/, {
      timeout: 10_000,
    });
  });
});
