# Utility Scripts

Standalone Node.js scripts for automated UI/UX auditing. Used by Phase 0 and Phase 3 agents but runnable independently.

## Setup

```bash
cd claude-workflow-ui-uplift
npm install
npx playwright install chromium
```

## Scripts

### extract-computed-styles.js
Extracts all computed CSS values (colors, fonts, spacing, radii, shadows, transitions) from visible elements.

```bash
node scripts/extract-computed-styles.js http://localhost:3000
node scripts/extract-computed-styles.js http://localhost:3000 --viewport 375x812
```

Output: JSON with frequency counts per CSS property value.

### audit-interactions.js
Tests interactive elements for states and measures touch targets.

```bash
node scripts/audit-interactions.js http://localhost:3000
node scripts/audit-interactions.js http://localhost:3000 --mobile
```

Output: JSON with per-element state presence, touch target dimensions, ARIA label audit.

### lighthouse-batch.js
Runs Lighthouse on all routes from a route manifest.

```bash
node scripts/lighthouse-batch.js docs/audit/01-route-manifest.md
node scripts/lighthouse-batch.js docs/audit/01-route-manifest.md --base-url https://staging.example.com
```

Output: JSON with per-route Lighthouse scores (performance, accessibility, best practices, SEO).

### visual-regression.js
Pixel-level comparison of before/after screenshot directories.

```bash
node scripts/visual-regression.js docs/audit/screenshots docs/validation/screenshots-after
node scripts/visual-regression.js before/ after/ --threshold 0.05 --output diffs/
```

Output: JSON report + diff PNG images for changed screenshots.
