/**
 * proposal-editor.spec.ts
 *
 * Verifies the three-panel proposal editor page:
 *  - Sections render with titles and content
 *  - Confidence badges are visible and color-coded
 *  - Requirements sidebar shows items
 *  - "Select all requirements" button works
 *  - KB panel toggle shows/hides the panel
 *
 * Depends on at least one proposal with generated sections in the DB.
 */

import { test, expect } from "@playwright/test";

/**
 * Helper: navigate to the first proposal that has sections.
 * Returns false if no suitable proposal is found.
 */
async function goToFirstProposalWithSections(
  page: import("@playwright/test").Page,
): Promise<boolean> {
  await page.goto("/proposals");

  // Wait for list to load.
  await page
    .locator("ul li")
    .or(page.getByText(/no proposals yet/i))
    .first()
    .waitFor({ timeout: 15_000 });

  const empty = await page.getByText(/no proposals yet/i).isVisible();
  if (empty) return false;

  // Click the first proposal.
  await page.locator("ul li button").first().click();
  await page.waitForURL(/\/proposals\/[a-z0-9-]+/, { timeout: 10_000 });

  // Wait until the page is no longer in loading state (spinner gone).
  await page
    .locator(".animate-spin")
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {
      // spinner may never appear for a fast load — that's fine
    });

  return true;
}

test.describe("Proposal editor", () => {
  test("loads an existing proposal and shows header breadcrumb", async ({
    page,
  }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    // Breadcrumb link back (text is "← Proposals").
    await expect(page.getByText(/←/).first()).toBeVisible();
    // Proposal title in the header (the <p> next to breadcrumb).
    const titleEl = page.locator(
      'div[class*="min-w-0"] p[class*="font-semibold"]',
    );
    await expect(titleEl).toBeVisible();
    await expect(titleEl).not.toBeEmpty();
  });

  test("renders section editors when sections exist", async ({ page }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    // If we're at the RFP upload screen there are no sections yet.
    const rfpUpload = page.getByText(/upload.*rfp/i).first();
    const hasSections = !(await rfpUpload.isVisible());

    if (!hasSections) {
      test.skip(true, "Proposal has no sections yet — cannot test editor");
      return;
    }

    // Each section has a heading (h3) inside the editor card.
    const sectionHeadings = page.locator("h3");
    await expect(sectionHeadings.first()).toBeVisible();
  });

  test("confidence badges are visible and color-coded when sections have scores", async ({
    page,
  }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    // Confidence badge text contains "% confidence".
    const badges = page.locator('span:has-text("% confidence")');
    const count = await badges.count();
    if (count === 0) {
      test.skip(true, "No confidence scores on this proposal yet");
      return;
    }

    await expect(badges.first()).toBeVisible();

    // Badge must carry one of the three colour classes (green / amber / red).
    const firstBadgeClass = await badges.first().getAttribute("class");
    expect(firstBadgeClass).toMatch(/green|amber|red/);
  });

  test("requirements sidebar is visible with items or empty state", async ({
    page,
  }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    // The sidebar heading is always present.
    await expect(
      page.getByRole("heading", { name: /requirements/i }),
    ).toBeVisible();
  });

  test("Select all requirements button selects all and disappears", async ({
    page,
  }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    const btn = page.getByRole("button", { name: /select all requirements/i });
    const btnVisible = await btn.isVisible();
    if (!btnVisible) {
      // Button only shows when selectedReqIds is empty — may already be selected.
      test.skip(
        true,
        "Select all button not visible (requirements may already be selected)",
      );
      return;
    }

    await btn.click();

    // After clicking, the button should disappear (selectedReqIds.size > 0).
    await expect(btn).not.toBeVisible({ timeout: 5_000 });
  });

  test("KB panel toggle shows and hides the KB panel", async ({ page }) => {
    const found = await goToFirstProposalWithSections(page);
    if (!found) {
      test.skip(true, "No proposals in DB");
      return;
    }

    // The KB toggle button is always in the header toolbar.
    const kbToggle = page.getByRole("button", { name: /kb/i }).first();
    await expect(kbToggle).toBeVisible();

    // KB panel contains a search input — look for it.
    const kbSearchInput = page.locator(
      'input[placeholder*="search"], input[placeholder*="Search"]',
    );

    // Initial state: panel is visible (showKbPanel defaults to true).
    // Toggle off.
    await kbToggle.click();
    await expect(kbSearchInput).not.toBeVisible({ timeout: 3_000 });

    // Toggle back on.
    await kbToggle.click();
    await expect(kbSearchInput).toBeVisible({ timeout: 3_000 });
  });
});
