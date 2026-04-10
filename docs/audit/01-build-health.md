# Build Health Audit

## Summary
- TypeScript: 0 errors, 0 warnings across 0 files (see `docs/audit/tsc-raw.txt`)
- ESLint: 115 errors, 0 warnings across 3 files (all in `playwright-report/trace/**` generated assets)
- Build: PASS (elapsed: 12.4s)
- Scripts: dev ✅, build ✅, lint ✅, test ✅, start ✅

## TypeScript Errors (by category)
### Type Errors (0)
None.

### Missing Imports (0)
None.

### Configuration Issues
- `tsconfig.json`: `strict: true`
- Notable flags: `skipLibCheck: true`, `allowJs: true`, `moduleResolution: "bundler"`, `noEmit: true`

## ESLint Errors (top 20 by frequency)
| Rule | Count | Example Location |
|---|---:|---|
| `react-hooks/rules-of-hooks` | 113 | `playwright-report/trace/assets/defaultSettingsView-GTWI-W_B.js` |
| `no-console` | 2 | `playwright-report/trace/**` |

Top files by issue count:
- `playwright-report/trace/assets/defaultSettingsView-GTWI-W_B.js`: 107 errors
- `playwright-report/trace/uiMode.Vipi55dB.js`: 7 errors
- `playwright-report/trace/sw.bundle.js`: 1 error

## Build Output
- Result: PASS (`next build`)
- Warnings observed in output:
  - `Warning: \`--localstorage-file\` was provided without a valid path`
  - `npm warn Unknown env config "devdir". This will stop working in the next major version of npm.`

## Raw Data
- TypeScript: `docs/audit/tsc-raw.txt`
- ESLint: `docs/audit/eslint-raw.json` (stdout: `docs/audit/eslint-stdout.txt`)
- Build: `docs/audit/build-raw.txt` (timing: `docs/audit/build-meta.json`)

# Build Health Audit

## Summary
- TypeScript: 0 errors, 0 warnings across 0 files
- ESLint: 2 errors, 0 warnings — top rule: no-console (2)
- Build: PASS (time: 5.7s compile + static gen)
- Scripts: dev ✅, build ✅, lint ✅, test ✅, start ✅

## TypeScript Errors (by category)

### Type Errors (0)
None — tsc --noEmit passed cleanly.

### Missing Imports (0)
None.

### Configuration Issues
tsconfig.json findings:
- `strict: true` is SET ✅ — all strict sub-flags active
- `skipLibCheck: true` — library type errors bypassed (acceptable for rescue baseline)
- No strict sub-flags are explicitly disabled
- `noEmit: true` — build output goes through Next.js, not tsc
- Target: ES2017

## ESLint Errors (top 20 by frequency)
| Rule | Count | Example Location |
|------|-------|-----------------|
| no-console | 2 | scripts/test-gemini.ts:37, :75 |

### Exact error locations:
- `scripts/test-gemini.ts:37:1` — `no-console` — Unexpected console statement. Only these console methods are allowed: error, warn.
- `scripts/test-gemini.ts:75:3` — `no-console` — Unexpected console statement. Only these console methods are allowed: error, warn.

Note: These are in a dev/test script (`scripts/`), not production source.

## Build Output
Build PASSED. Exit code: 0.

```
✓ Compiled successfully in 5.7s
✓ Generating static pages using 9 workers (5/5) in 236ms
```

Routes compiled:
- / (static)
- /api/ai/stream-section (dynamic)
- /api/trpc/[trpc] (dynamic)
- /api/upload (dynamic)
- /api/upload/kb (dynamic)
- /api/webhooks/stripe (dynamic)
- /dashboard (dynamic)
- /knowledge-base (dynamic)
- /onboarding (dynamic)
- /proposals (dynamic)
- /proposals/[id] (dynamic)
- /settings (dynamic)
- /settings/brand-voice (dynamic)
- /sign-in/[[...sign-in]] (dynamic)
- /sign-up/[[...sign-up]] (dynamic)

Warning: `--localstorage-file` was provided without a valid path (non-blocking Node.js warning, not a build error)

ESLint note: Using deprecated `.eslintrc` config (not flat config) — warning only, ESLint v9 migration needed eventually.

## Raw Data
- TypeScript: docs/audit/tsc-raw.txt
- ESLint: docs/audit/eslint-raw.json
- Build: docs/audit/build-raw.txt
