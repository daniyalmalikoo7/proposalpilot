/**
 * navigation.spec.ts
 *
 * Verifies sidebar navigation and breadcrumb behaviour:
 *  - Sidebar highlights the correct item per route
 *  - Breadcrumb on the editor page returns to /proposals (breadcrumb says "← Dashboard" in this app)
 *  - Navigating between top-level routes updates the active sidebar item
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar highlights Proposals when on /proposals", async ({ page }) => {
    await page.goto("/proposals");
    await page.waitForLoadState("networkidle");

    const proposalsLink = page.getByRole("link", { name: /^proposals$/i });
    const cls = await proposalsLink.getAttribute("class");
    expect(cls).toMatch(/bg-primary/);
  });

  test("sidebar highlights Knowledge Base when on /knowledge-base", async ({
    page,
  }) => {
    await page.goto("/knowledge-base");
    await page.waitForLoadState("networkidle");

    const kbLink = page.getByRole("link", { name: /knowledge base/i });
    const cls = await kbLink.getAttribute("class");
    expect(cls).toMatch(/bg-primary/);
  });

  test("sidebar highlights Dashboard when on /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const dashLink = page.getByRole("link", { name: /dashboard/i }).first();
    const cls = await dashLink.getAttribute("class");
    expect(cls).toMatch(/bg-primary/);
  });

  test("sidebar Proposals link is NOT active when on /knowledge-base", async ({
    page,
  }) => {
    await page.goto("/knowledge-base");
    await page.waitForLoadState("networkidle");

    const proposalsLink = page.getByRole("link", { name: /^proposals$/i });
    const cls = await proposalsLink.getAttribute("class");
    expect(cls).not.toMatch(/bg-primary/);
  });

  test("navigating via sidebar links changes the active item", async ({
    page,
  }) => {
    await page.goto("/proposals");
    await page.waitForLoadState("networkidle");

    // Click Knowledge Base in sidebar.
    await page.getByRole("link", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/knowledge-base");

    const kbLink = page.getByRole("link", { name: /knowledge base/i });
    const activeClass = await kbLink.getAttribute("class");
    expect(activeClass).toMatch(/bg-primary/);

    // Old Proposals link should no longer be active.
    const proposalsLink = page.getByRole("link", { name: /^proposals$/i });
    const proposalsClass = await proposalsLink.getAttribute("class");
    expect(proposalsClass).not.toMatch(/bg-primary/);
  });

  test("editor breadcrumb navigates back to dashboard", async ({ page }) => {
    // Navigate to proposals list first.
    await page.goto("/proposals");
    await page
      .locator("ul li")
      .or(page.getByText(/no proposals yet/i))
      .first()
      .waitFor({ timeout: 15_000 });

    const isEmpty = await page.getByText(/no proposals yet/i).isVisible();
    if (isEmpty) {
      test.skip(true, "No proposals in DB — cannot test editor breadcrumb");
      return;
    }

    // Open first proposal.
    await page.locator("ul li button").first().click();
    await page.waitForURL(/\/proposals\/[a-z0-9-]+/, { timeout: 10_000 });

    // Click the "← Dashboard" breadcrumb.
    await page.getByText(/← dashboard/i).click();
    await expect(page).toHaveURL("/dashboard");
  });
});
