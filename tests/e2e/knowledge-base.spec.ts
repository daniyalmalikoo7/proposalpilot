/**
 * knowledge-base.spec.ts
 *
 * Verifies the /knowledge-base page:
 *  - Existing KB documents render in the grid (or empty state)
 *  - Upload button is visible
 *  - Search input exists and accepts text
 *  - Type filter tabs are present
 */

import { test, expect } from "@playwright/test";

test.describe("Knowledge base", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/knowledge-base");
    // Wait for the list query to resolve.
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
    await expect(
      page.getByRole("button", { name: /upload document/i }),
    ).toBeVisible();
  });

  test("search input is visible and accepts text", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search your knowledge base/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test query");
    await expect(searchInput).toHaveValue("test query");
  });

  test("type filter tabs are all present", async ({ page }) => {
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
  });

  test("clicking a filter tab activates it", async ({ page }) => {
    const caseStudiesBtn = page
      .getByRole("button", { name: /case studies/i })
      .first();
    await caseStudiesBtn.click();

    // Active tab gets bg-primary class.
    const activeClass = await caseStudiesBtn.getAttribute("class");
    expect(activeClass).toMatch(/bg-primary/);
  });

  test("KB document grid or empty state is visible", async ({ page }) => {
    const emptyState = page.getByText(/your knowledge base is empty/i);
    const grid = page.locator('[class*="grid"] [class*="rounded-lg"]');

    const isEmpty = await emptyState.isVisible();
    if (isEmpty) {
      // Empty state — upload CTA should be visible.
      await expect(
        page.getByRole("button", { name: /upload your first document/i }),
      ).toBeVisible();
    } else {
      // Grid has at least one card.
      await expect(grid.first()).toBeVisible();
    }
  });

  test("Upload Document button reveals the upload form", async ({ page }) => {
    await page.getByRole("button", { name: /upload document/i }).click();

    // KBUploadForm renders — look for a file input or form heading.
    const uploadForm = page.locator(
      'form, [class*="upload"], input[type="file"]',
    );
    await expect(uploadForm.first()).toBeVisible({ timeout: 3_000 });
  });
});
