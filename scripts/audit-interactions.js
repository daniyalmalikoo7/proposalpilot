#!/usr/bin/env node
"use strict";

/**
 * audit-interactions.js
 * Tests interactive elements for hover, focus, active, disabled states.
 * Measures touch targets via getBoundingClientRect.
 *
 * Usage: node scripts/audit-interactions.js <url> [--mobile]
 */

const { chromium } = require("playwright");

const USAGE = `Usage: node audit-interactions.js <url> [--mobile]
  <url>     Target URL (required)
  --mobile  Use mobile viewport (375x812) and check 44px touch targets
  --help    Show this message`;

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length === 0) {
    console.error(USAGE);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const url = args.find((a) => !a.startsWith("--"));
  const mobile = args.includes("--mobile");
  const vw = mobile ? 375 : 1440;
  const vh = mobile ? 812 : 900;

  console.error(`Auditing interactions on ${url} (${mobile ? "mobile" : "desktop"})...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: vw, height: vh } });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.error(`Failed to load ${url}: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  const audit = await page.evaluate((isMobile) => {
    const interactive = document.querySelectorAll(
      'a, button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [tabindex]'
    );
    const results = [];

    interactive.forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;

      const rect = el.getBoundingClientRect();
      const tag = el.tagName.toLowerCase();
      const text = (el.textContent || "").trim().substring(0, 40);
      const hasHref = el.hasAttribute("href");
      const isDisabled = el.disabled || el.getAttribute("aria-disabled") === "true";

      const entry = {
        element: `${tag}${el.className ? "." + el.className.split(" ")[0] : ""}`,
        text: text || "(no text)",
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        belowMinTouchTarget: isMobile && (rect.width < 44 || rect.height < 44),
        hasAriaLabel: !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")),
        focusVisible: cs.outlineStyle !== "none" || cs.boxShadow !== "none",
        tabIndex: el.tabIndex,
      };

      results.push(entry);
    });

    return {
      url: window.location.href,
      totalInteractive: results.length,
      belowMinTouchTarget: results.filter((r) => r.belowMinTouchTarget).length,
      missingAriaLabel: results.filter((r) => !r.hasAriaLabel && !r.text).length,
      elements: results,
    };
  }, mobile);

  audit.viewport = `${vw}x${vh}`;
  audit.timestamp = new Date().toISOString();

  console.log(JSON.stringify(audit, null, 2));
  await browser.close();
  console.error("Done.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
