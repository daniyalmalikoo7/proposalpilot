#!/usr/bin/env node
"use strict";

/**
 * visual-regression.js
 * Compares before/after screenshot directories using pixelmatch.
 * Outputs diff images and a regression report.
 *
 * Usage: node scripts/visual-regression.js <before-dir> <after-dir> [--threshold <0-1>]
 */

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const USAGE = `Usage: node visual-regression.js <before-dir> <after-dir> [--threshold <0-1>]
  <before-dir>  Directory with before screenshots (PNG)
  <after-dir>   Directory with after screenshots (PNG)
  --threshold   Pixel match threshold 0-1 (default: 0.1)
  --output      Output directory for diff images (default: <after-dir>/../screenshots-diff)
  --help        Show this message`;

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length < 2) {
    console.error(USAGE);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const beforeDir = args[0];
  const afterDir = args[1];
  let threshold = 0.1;
  const thIdx = args.indexOf("--threshold");
  if (thIdx !== -1) threshold = parseFloat(args[thIdx + 1]) || 0.1;

  let outputDir = path.join(path.dirname(afterDir), "screenshots-diff");
  const outIdx = args.indexOf("--output");
  if (outIdx !== -1) outputDir = args[outIdx + 1];

  if (!fs.existsSync(beforeDir)) { console.error(`Before dir not found: ${beforeDir}`); process.exit(1); }
  if (!fs.existsSync(afterDir)) { console.error(`After dir not found: ${afterDir}`); process.exit(1); }
  fs.mkdirSync(outputDir, { recursive: true });

  const beforeFiles = fs.readdirSync(beforeDir).filter((f) => f.endsWith(".png"));
  const afterFiles = fs.readdirSync(afterDir).filter((f) => f.endsWith(".png"));

  const report = { timestamp: new Date().toISOString(), threshold, comparisons: [], summary: { total: 0, matched: 0, differing: 0, missingAfter: 0, newInAfter: 0 } };

  for (const file of beforeFiles) {
    report.summary.total++;
    const afterPath = path.join(afterDir, file);

    if (!fs.existsSync(afterPath)) {
      report.summary.missingAfter++;
      report.comparisons.push({ file, status: "missing-after", diffPixels: null, diffPercent: null });
      continue;
    }

    const before = PNG.sync.read(fs.readFileSync(path.join(beforeDir, file)));
    const after = PNG.sync.read(fs.readFileSync(afterPath));

    const w = Math.min(before.width, after.width);
    const h = Math.min(before.height, after.height);
    const diff = new PNG({ width: w, height: h });

    const numDiff = pixelmatch(before.data, after.data, diff.data, w, h, { threshold });
    const totalPixels = w * h;
    const pct = ((numDiff / totalPixels) * 100).toFixed(2);

    if (numDiff > 0) {
      report.summary.differing++;
      fs.writeFileSync(path.join(outputDir, `diff-${file}`), PNG.sync.write(diff));
    } else {
      report.summary.matched++;
    }

    report.comparisons.push({ file, status: numDiff > 0 ? "different" : "match", diffPixels: numDiff, diffPercent: parseFloat(pct) });
  }

  for (const file of afterFiles) {
    if (!beforeFiles.includes(file)) {
      report.summary.newInAfter++;
      report.comparisons.push({ file, status: "new-in-after", diffPixels: null, diffPercent: null });
    }
  }

  console.log(JSON.stringify(report, null, 2));
  console.error(`Done. ${report.summary.differing} files differ, ${report.summary.matched} match, ${report.summary.missingAfter} missing.`);
}

main();
