/**
 * generation-flow.spec.ts
 *
 * End-to-end test for the AI generation flow:
 *  1. Navigate to an existing proposal that has sections
 *  2. Select all requirements
 *  3. Click "Regenerate" on the first section
 *  4. Wait for the SSE stream to complete (spinner disappears, content visible)
 *  5. Verify the confidence badge updates
 *  6. Verify the section content is non-empty
 *
 * This test calls real AI (Gemini). Timeout is 90 s to accommodate streaming.
 * It is skipped automatically if no suitable proposal exists in the DB.
 */

import { test, expect } from "@playwright/test";

// Generous timeout — generation can take up to 30 s, plus retries.
test.setTimeout(90_000);

test.describe("Generation flow (real AI)", () => {
  test("regenerates a section and shows updated content + confidence badge", async ({
    page,
  }) => {
    // --- Setup: find a proposal with sections ---
    await page.goto("/proposals");
    await page
      .locator("ul li")
      .or(page.getByText(/no proposals yet/i))
      .first()
      .waitFor({ timeout: 15_000 });

    const isEmpty = await page.getByText(/no proposals yet/i).isVisible();
    if (isEmpty) {
      test.skip(true, "No proposals in DB");
      return;
    }

    await page.locator("ul li button").first().click();
    await page.waitForURL(/\/proposals\/[a-z0-9-]+/, { timeout: 10_000 });

    // Wait for loading spinner to clear.
    await page
      .locator(".animate-spin")
      .waitFor({ state: "hidden", timeout: 15_000 })
      .catch(() => {});

    // Skip if we're at the RFP upload screen (no sections yet).
    const rfpScreen = page.getByText(/upload.*rfp|drag.*drop/i).first();
    const onRfpScreen = await rfpScreen.isVisible();
    if (onRfpScreen) {
      test.skip(true, "Proposal has no sections yet");
      return;
    }

    // --- Select all requirements (enables Regenerate) ---
    const selectAllBtn = page.getByRole("button", {
      name: /select all requirements/i,
    });
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click();
      // Button should disappear after selection.
      await expect(selectAllBtn).not.toBeVisible({ timeout: 3_000 });
    }

    // --- Locate the first section card ---
    const firstSectionCard = page
      .locator('[class*="rounded-lg border"][class*="bg-card"]')
      .first();
    await expect(firstSectionCard).toBeVisible();

    // Capture the current content to detect a change after regeneration.
    const editorContent = firstSectionCard.locator(
      '[class*="prose"], .ProseMirror',
    );
    const contentBefore = await editorContent.innerText().catch(() => "");

    // --- Click Regenerate ---
    const regenerateBtn = firstSectionCard.getByRole("button", {
      name: /regenerate/i,
    });
    await expect(regenerateBtn).toBeVisible({ timeout: 5_000 });
    await regenerateBtn.click();

    // --- Wait for "Generating…" state to appear ---
    const generatingBtn = firstSectionCard.getByRole("button", {
      name: /generating/i,
    });
    await expect(generatingBtn).toBeVisible({ timeout: 10_000 });

    // --- Wait for generation to complete (Generating… button disappears) ---
    await expect(generatingBtn).not.toBeVisible({ timeout: 60_000 });

    // --- Assert: content is non-empty after generation ---
    const contentAfter = await editorContent.innerText();
    expect(contentAfter.trim().length).toBeGreaterThan(0);

    // Regeneration MUST produce different content — if it returned the same
    // text, the streaming pipeline silently failed. This is a hard failure.
    expect(
      contentAfter.trim(),
      "Regenerated content must differ from previous content — identical output means the AI generation pipeline failed silently",
    ).not.toBe(contentBefore.trim());

    // --- Assert: confidence badge is present ---
    const confidenceBadge = firstSectionCard.locator(
      'span:has-text("% confidence")',
    );
    await expect(confidenceBadge).toBeVisible({ timeout: 5_000 });

    // Badge score must be a valid percentage string.
    const badgeText = await confidenceBadge.innerText();
    expect(badgeText).toMatch(/^\d+% confidence$/);
  });
});
