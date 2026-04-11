#!/usr/bin/env node
"use strict";

/**
 * extract-computed-styles.js
 * Extracts all computed CSS values from visible elements on a page.
 * Outputs structured JSON matching the visual-quality-auditor schema.
 *
 * Usage: node scripts/extract-computed-styles.js <url> [--viewport <width>x<height>]
 * Example: node scripts/extract-computed-styles.js http://localhost:3000 --viewport 1440x900
 */

const { chromium } = require("playwright");

const USAGE = `Usage: node extract-computed-styles.js <url> [--viewport <width>x<height>]
  <url>       Target URL (required)
  --viewport  Viewport size (default: 1440x900)
  --help      Show this message`;

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length === 0) {
    console.error(USAGE);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const url = args.find((a) => !a.startsWith("--"));
  if (!url) { console.error("Error: URL required.\n" + USAGE); process.exit(1); }

  let vw = 1440, vh = 900;
  const vpIdx = args.indexOf("--viewport");
  if (vpIdx !== -1 && args[vpIdx + 1]) {
    const [w, h] = args[vpIdx + 1].split("x").map(Number);
    if (w && h) { vw = w; vh = h; }
  }

  console.error(`Extracting styles from ${url} at ${vw}x${vh}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: vw, height: vh } });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.error(`Failed to load ${url}: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  const styles = await page.evaluate(() => {
    const result = { colors: {}, fontSizes: {}, fontFamilies: {}, spacing: {}, borderRadii: {}, shadows: {}, transitions: [] };
    const count = (obj, val) => { obj[val] = (obj[val] || 0) + 1; };
    const els = document.querySelectorAll("body *");

    els.forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;

      count(result.colors, cs.color);
      count(result.colors, cs.backgroundColor);
      if (cs.borderColor !== "rgb(0, 0, 0)") count(result.colors, cs.borderColor);
      count(result.fontSizes, cs.fontSize);
      count(result.fontFamilies, cs.fontFamily.split(",")[0].trim().replace(/"/g, ""));
      count(result.borderRadii, cs.borderRadius);

      const shadow = cs.boxShadow;
      if (shadow && shadow !== "none") count(result.shadows, shadow);

      ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
       "marginTop", "marginRight", "marginBottom", "marginLeft",
       "gap", "rowGap", "columnGap"].forEach((prop) => {
        const v = cs[prop];
        if (v && v !== "0px" && v !== "normal" && v !== "auto") count(result.spacing, v);
      });

      const transition = cs.transition;
      if (transition && transition !== "all 0s ease 0s" && transition !== "none") {
        result.transitions.push({ element: el.tagName + (el.className ? "." + el.className.split(" ")[0] : ""), value: transition });
      }
    });

    result.elementCount = els.length;
    return result;
  });

  styles.url = url;
  styles.viewport = `${vw}x${vh}`;
  styles.timestamp = new Date().toISOString();

  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
  console.error("Done.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
