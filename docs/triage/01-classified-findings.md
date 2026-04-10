# Classified Findings

## Summary
| Severity | Count | Auto-fixable | Requires Judgment |
|----------|------:|-------------:|------------------:|
| CRITICAL | 1 | 0 | 1 |
| HIGH | 3 | 0 | 3 |
| MEDIUM | 7 | 3 | 4 |
| LOW | 5 | 2 | 3 |
| **Total** | **16** | **5** | **11** |

## CRITICAL Findings
| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|------------------|-----------|
| C1 | FEATURE | Dev server runtime instability — all pages return 500 / ECONNRESET. Clerk middleware proxy loop causes repeated "Failed to proxy … localhost:3000" socket hang ups. 0/10 pages verifiably render. | `src/proxy.ts` (middleware), Next.js config | 04-runtime-health.md, 06-rescue-decision.md | No — requires judgment |

## HIGH Findings
| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|------------------|-----------|
| H1 | BUILD | ESLint scope includes generated `playwright-report/trace/**` files — 115 false-positive errors (113 `react-hooks/rules-of-hooks` + 2 `no-console`) pollute lint results. Needs `.eslintignore` or config exclusion. | `.eslintrc.json`, `playwright-report/trace/**` | 01-build-health.md | No — config change |
| H2 | SECURITY | Semgrep SAST scan could not run authoritatively — network-blocked from fetching rulesets (`semgrep.dev` 403). Security posture is **unverified** by tooling. | `docs/audit/semgrep-raw.json` | 03-security-scan.md | No — requires re-run with network or vendored rules |
| H3 | SECURITY | `ai.generateSection` tRPC procedure does not explicitly call `sanitizeForPrompt` on user-supplied prompt variables before template rendering (unlike the streaming endpoint which does). Medium prompt-injection risk. | `src/server/routers/ai.ts` | 03-security-scan.md | No — requires judgment |

## MEDIUM Findings
| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|------------------|-----------|
| M1 | DEPENDENCY | 7 unused production dependencies detected by Knip: `@anthropic-ai/sdk`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-scroll-area`, `@radix-ui/react-separator`, `@radix-ui/react-toast`, `@trpc/next` | `package.json` | 02-dependency-health.md | Yes — `knip --fix` or manual removal |
| M2 | DEPENDENCY | 4 unused devDependencies: `@testing-library/react`, `dependency-cruiser`, `eslint-config-next`, `jest-environment-jsdom` | `package.json` | 02-dependency-health.md | Yes — `knip --fix` or manual removal |
| M3 | DEPENDENCY | 14 packages are major versions behind (stripe +5, @types/node +5, clerk +1, prisma +1, zod +1, tailwind +1, etc.) | `package.json` | 02-dependency-health.md | No — requires evaluation per package |
| M4 | DEPENDENCY | 3 unlisted/unresolved packages: `postcss-load-config`, `dotenv` (unlisted), `babel-jest` (unresolved) | `postcss.config.js`, `playwright.config.ts`, `jest.config.js` | 02-dependency-health.md | No — requires adding to deps or removing usage |
| M5 | DEPENDENCY | 16 unused exports across `src/` (e.g., `buttonVariants`, `AuthorizationError`, `toAppError`, `MODEL_IDS`, `publicProcedure`, etc.) | Various files across `src/` | 02-dependency-health.md | Yes — `knip --fix` |
| M6 | ARCHITECTURE | Test coverage is very low: 9 test files / ~99 source files. No unit tests for tRPC routers, AI processing, or Prisma queries. | `src/server/routers/*.ts`, `src/lib/ai/**` | 05-architecture-health.md | No — requires writing tests |
| M7 | DEPENDENCY | 7 unused files detected by Knip (e.g., `scripts/test-gemini.ts`, `tests/global-setup.ts`, `src/lib/ai/services/generate-section.ts`, `src/lib/ai/validators/section-generator-input.ts`, archived hooks) | Various | 02-dependency-health.md | No — requires judgment (some may be needed) |

## LOW Findings
| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|------------------|-----------|
| L1 | DEPENDENCY | 4 low-severity CVEs in `jest-environment-jsdom` chain (`@tootallnate/once`, `http-proxy-agent`, `jsdom`). Test-only, not production. Fix requires major bump to jest-environment-jsdom@30. | `package.json` (devDeps) | 02-dependency-health.md | No — major version bump |
| L2 | DEPENDENCY | 4 extraneous packages in `node_modules` (`@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@tybys/wasm-util`) | `node_modules/` | 02-dependency-health.md | Yes — `npm prune` |
| L3 | BUILD | ESLint uses deprecated `.eslintrc` config format (ESLint v9+ defaults to flat config); deprecation warning emitted on every lint run. | `.eslintrc.json` | 01-build-health.md | No — migration effort |
| L4 | DEPENDENCY | Minor/patch-behind packages: `next` 16.2.1→16.2.3, `react`/`react-dom` 19.2.4→19.2.5, `postcss` 8.5.8→8.5.9, `@tanstack/react-query`, Tiptap packages | `package.json` | 02-dependency-health.md | Yes — `npm update` |
| L5 | ARCHITECTURE | Env validation in `src/lib/config.ts` uses custom proxy pattern instead of Zod — functional but no structured validation errors or startup-time checking. | `src/lib/config.ts` | 05-architecture-health.md | No — enhancement |
