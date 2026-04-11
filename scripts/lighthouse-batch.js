#!/usr/bin/env node
"use strict";

/**
 * lighthouse-batch.js
 * Runs Lighthouse on all routes from a route manifest file.
 * Outputs per-route scores as JSON.
 *
 * Usage: node scripts/lighthouse-batch.js <route-manifest.md> [--base-url <url>]
 */

const { execSync } = require("child_process");
const fs = require("fs");

const USAGE = `Usage: node lighthouse-batch.js <route-manifest.md> [--base-url <url>]
  <manifest>   Path to route manifest markdown (with route table)
  --base-url   Base URL (default: http://localhost:3000)
  --help       Show this message`;

function extractRoutes(manifestPath) {
  const content = fs.readFileSync(manifestPath, "utf-8");
  const routes = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/\|\s*\d+\s*\|\s*(\/[^\s|]*)\s*\|/);
    if (match) routes.push(match[1]);
  }

  if (routes.length === 0) {
    const pathMatches = content.match(/(?:^|\s)(\/[a-z][a-z0-9\-\/\[\]]*)/gm);
    if (pathMatches) pathMatches.forEach((m) => routes.push(m.trim()));
  }

  return [...new Set(routes)];
}

function runLighthouse(url) {
  try {
    const cmd = `npx lighthouse "${url}" --output=json --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo 2>/dev/null`;
    const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 120000 }).toString();
    const data = JSON.parse(output);

    return {
      url,
      performance: Math.round((data.categories.performance?.score || 0) * 100),
      accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((data.categories["best-practices"]?.score || 0) * 100),
      seo: Math.round((data.categories.seo?.score || 0) * 100),
      lcp: data.audits["largest-contentful-paint"]?.numericValue || null,
      cls: data.audits["cumulative-layout-shift"]?.numericValue || null,
      status: "success",
    };
  } catch (e) {
    return { url, status: "error", error: e.message.substring(0, 200) };
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length === 0) {
    console.error(USAGE);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const manifest = args.find((a) => !a.startsWith("--"));
  if (!manifest || !fs.existsSync(manifest)) {
    console.error(`Manifest not found: ${manifest}`);
    process.exit(1);
  }

  let baseUrl = "http://localhost:3000";
  const buIdx = args.indexOf("--base-url");
  if (buIdx !== -1) baseUrl = args[buIdx + 1];

  const routes = extractRoutes(manifest);
  if (routes.length === 0) {
    console.error("No routes found in manifest.");
    process.exit(1);
  }

  console.error(`Found ${routes.length} routes. Running Lighthouse...`);
  const results = { timestamp: new Date().toISOString(), baseUrl, routes: [] };

  for (const route of routes) {
    const fullUrl = `${baseUrl}${route}`;
    console.error(`  Testing ${fullUrl}...`);
    results.routes.push(runLighthouse(fullUrl));
  }

  const successful = results.routes.filter((r) => r.status === "success");
  if (successful.length > 0) {
    results.averages = {
      performance: Math.round(successful.reduce((s, r) => s + r.performance, 0) / successful.length),
      accessibility: Math.round(successful.reduce((s, r) => s + r.accessibility, 0) / successful.length),
    };
  }

  console.log(JSON.stringify(results, null, 2));
  console.error("Done.");
}

main();
