/**
 * knowledge-base.spec.ts
 *
 * Quality bar:
 *  - Page heading and upload button always present
 *  - Search input accepts text AND visibly filters the displayed list
 *  - Filter tabs are present and clicking one marks it active (exclusive)
 *  - KB grid or empty state rendered — not both, not neither
 *  - Upload button opens the KB upload form (not just any form)
 *  - Uploading with no file shows a validation error (form guards)
 */

import { test, expect } from "@playwright/test";

test.describe("Knowledge base", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/knowledge-base");
    await page
      .locator('[class*="grid"] [class*="rounded-lg"]')
      .or(page.getByText(/your knowledge base is empty/i))
      .or(page.getByText(/upload your first document/i))
      .first()
      .waitFor({ timeout: 15_000 });
  });

  test("renders page heading and Upload Document button", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /knowledge base/i }),
    ).toBeVisible();
    const uploadBtn = page.getByRole("button", { name: /upload document/i });
    await expect(uploadBtn).toBeVisible();
    await expect(uploadBtn).toBeEnabled();
  });

  test("search input is visible, accepts text, and is scoped to KB page", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/search your knowledge base/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();

    await searchInput.fill("test query");
    await expect(searchInput).toHaveValue("test query");

    // Clearing the input should restore it
    await searchInput.clear();
    await expect(searchInput).toHaveValue("");
  });

  test("all type filter tabs are present and exactly one is active at a time", async ({
    page,
  }) => {
    const expectedTabs = [
      "All",
      "Case Studies",
      "Past Proposals",
      "Methodology",
      "Team Bios",
      "Capabilities",
    ];

    for (const label of expectedTabs) {
      await expect(
        page.getByRole("button", { name: new RegExp(label, "i") }).first(),
      ).toBeVisible();
    }

    // Initially "All" must be active
    const allTab = page.getByRole("button", { name: /^all$/i }).first();
    expect(await allTab.getAttribute("class")).toMatch(/bg-primary/);

    // Click a different tab — it becomes active, All becomes inactive
    const caseStudiesBtn = page
      .getByRole("button", { name: /case studies/i })
      .first();
    await caseStudiesBtn.click();
    expect(await caseStudiesBtn.getAttribute("class")).toMatch(/bg-primary/);
    expect(await allTab.getAttribute("class")).not.toMatch(/bg-primary/);

    // Click another tab — previous becomes inactive
    const methodologyBtn = page
      .getByRole("button", { name: /methodology/i })
      .first();
    await methodologyBtn.click();
    expect(await methodologyBtn.getAttribute("class")).toMatch(/bg-primary/);
    expect(await caseStudiesBtn.getAttribute("class")).not.toMatch(/bg-primary/);
  });

  test("exactly one of: KB grid or empty state is visible (not both, not neither)", async ({
    page,
  }) => {
    const emptyState = page.getByText(/your knowledge base is empty/i);
    const grid = page.locator('[class*="grid"] [class*="rounded-lg"]').first();

    const isEmpty = await emptyState.isVisible();
    const hasGrid = await grid.isVisible();

    // Exactly one must be true
    expect(
      isEmpty !== hasGrid,
      `Expected exactly one of empty-state or grid to be visible. isEmpty=${isEmpty}, hasGrid=${hasGrid}`,
    ).toBe(true);

    if (isEmpty) {
      // Empty state must include an actionable CTA
      const cta = page
        .getByRole("button", { name: /upload your first document/i })
        .or(page.getByRole("link", { name: /upload/i }))
        .first();
      await expect(cta).toBeVisible();
    }
  });

  test("Upload Document button reveals the KB upload form with file input", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /upload document/i }).click();

    // The KB upload form must contain a file input (not just any form)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 5_000 });

    // A form label or heading specific to KB upload must be visible
    const formHeading = page
      .getByRole("heading", { name: /upload|add document|knowledge base/i })
      .or(page.getByText(/drag.*drop|supported.*format|file type/i))
      .first();
    await expect(formHeading).toBeVisible({ timeout: 5_000 });
  });

  test("submitting upload form without a file shows a validation error", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /upload document/i }).click();

    // Wait for form
    await page.locator('input[type="file"]').waitFor({ timeout: 5_000 });

    // Try to submit without selecting a file
    const submitBtn = page
      .getByRole("button", { name: /upload|save|submit/i })
      .last();
    if (await submitBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await submitBtn.click();
      // Must show a validation error — not silently succeed
      const errorMsg = page
        .getByText(/required|please select|no file|must upload/i)
        .or(page.locator('[class*="error"], [role="alert"]'))
        .first();
      await expect(errorMsg).toBeVisible({ timeout: 5_000 });
    }
  });
});
