# Dependency Health Audit

## Summary
- Vulnerabilities: 0 critical, 0 high, 0 moderate, 4 low (4 fixable via `npm audit fix` but requires semver-major bump)
- Outdated: 14 major behind, 10 minor behind, 1 patch behind (25 total packages reported)
- Unused (Knip): 7 dependencies, 4 devDependencies, 16 exports, 7 files
- Peer deps: 0 warnings (via `npm ls` problems summary)

## Vulnerabilities (by severity)
### Low (4)
| Package | Version Range | Advisory | Fix Available | Direct/Transitive |
|---|---|---|---|---|
| `@tootallnate/once` | `<3.0.1` | `GHSA-vpq2-c234-7xj6` | Yes (via `jest-environment-jsdom@30.3.0`, major) | Transitive |
| `http-proxy-agent` | `4.0.1 - 5.0.0` | inherited from `@tootallnate/once` | Yes (via `jest-environment-jsdom@30.3.0`, major) | Transitive |
| `jsdom` | `16.6.0 - 22.1.0` | inherited chain | Yes (via `jest-environment-jsdom@30.3.0`, major) | Transitive |
| `jest-environment-jsdom` | `27.0.1 - 30.0.0-rc.1` | via `jsdom` | Yes (`30.3.0`, major) | Direct |

## Outdated Dependencies
### Major Version Behind (HIGH priority)
Notable major gaps from `npm outdated --json` (examples):
- `@clerk/nextjs`: 6.39.1 → 7.0.12
- `@prisma/client`: 6.19.2 → 7.7.0
- `prisma`: 6.19.3 → 7.7.0
- `jest`: 29.7.0 → 30.3.0
- `jest-environment-jsdom`: 29.7.0 → 30.3.0
- `stripe`: 17.7.0 → 22.0.1
- `tailwindcss`: 3.4.19 → 4.2.2
- `zod`: 3.25.76 → 4.3.6

Counts: 14 packages are major-behind.

### Minor/Patch Behind
Examples:
- `next`: 16.2.1 → 16.2.3
- `react` / `react-dom`: 19.2.4 → 19.2.5
- `@tanstack/react-query`: 5.95.2 → 5.97.0
- `postcss`: 8.5.8 → 8.5.9

## Unused Code (Knip)
### Unused Dependencies (7)
- `@anthropic-ai/sdk`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-separator`
- `@radix-ui/react-toast`
- `@trpc/next`

### Unused DevDependencies (4)
- `@testing-library/react`
- `dependency-cruiser`
- `eslint-config-next`
- `jest-environment-jsdom`

### Unused Exports (16 — sample)
- `src/components/atoms/button.tsx:56` — `buttonVariants`
- `src/lib/types/errors.ts:43` — `AuthorizationError`
- `src/lib/types/errors.ts:61` — `toAppError`
- `src/lib/ai/providers/types.ts:46` — `MODEL_IDS`

### Unused Files (7 — sample)
- `scripts/test-gemini.ts`
- `tests/global-setup.ts`
- `src/lib/ai/services/generate-section.ts`
- `src/lib/ai/validators/section-generator-input.ts`

### Unlisted / Unresolved
- Unlisted: `postcss-load-config`, `dotenv`
- Unresolved: `babel-jest`

## npm ls problems
- Extraneous packages: 4 (all under `@emnapi/*` / `@tybys/*`)

## Raw Data
- npm audit: `docs/audit/npm-audit-raw.json`
- npm outdated: `docs/audit/npm-outdated-raw.json`
- Knip: `docs/audit/knip-raw.json`
- npm ls: `docs/audit/npm-ls-raw.json`

# Dependency Health Audit

## Summary
- Vulnerabilities: 0 critical, 0 high, 0 moderate, 4 low (all fixable via major upgrade of jest-environment-jsdom)
- Outdated: 14 major behind, 7 minor behind, 2 patch behind
- Unused: 0 dependencies, 0 devDependencies, 0 exports, 0 files (Knip clean)
- Peer deps: 4 extraneous packages (emnapi/wasm-util leftovers — not peer dep warnings)

## Vulnerabilities (by severity)

### Critical (0)
None.

### High (0)
None.

### Low (4) — all in test-only dependency chain
| Package | Version | Advisory | Fix Available | Direct/Transitive |
|---------|---------|---------|--------------|------------------|
| @tootallnate/once | — | GHSA-vpq2-c234-7xj6 | jest-environment-jsdom@30.3.0 (major) | Direct |
| http-proxy-agent | — | via @tootallnate/once | jest-environment-jsdom@30.3.0 (major) | Transitive |
| jest-environment-jsdom | — | via jsdom | jest-environment-jsdom@30.3.0 (major) | Transitive |
| jsdom | — | via http-proxy-agent | jest-environment-jsdom@30.3.0 (major) | Transitive |

Note: All 4 vulnerabilities are in the jest-environment-jsdom chain (test tooling only, not production). Fix requires major version bump.

## Outdated Dependencies

### Major Version Behind (HIGH priority — 14 packages)
| Package | Current | Latest | Gap |
|---------|---------|--------|-----|
| @types/node | 20.19.37 | 25.5.2 | +5 major |
| stripe | 17.7.0 | 22.0.0 | +5 major |
| @clerk/nextjs | 6.39.1 | 7.0.11 | +1 major |
| @prisma/client | 6.19.2 | 7.7.0 | +1 major |
| eslint | 9.39.4 | 10.2.0 | +1 major |
| eslint-config-next | 15.2.3 | 16.2.2 | +1 major |
| jest | 29.7.0 | 30.3.0 | +1 major |
| jest-environment-jsdom | 29.7.0 | 30.3.0 | +1 major |
| lucide-react | 0.479.0 | 1.7.0 | +1 major |
| pdf-parse | 1.1.4 | 2.4.5 | +1 major |
| prisma | 6.19.2 | 7.7.0 | +1 major |
| tailwindcss | 3.4.19 | 4.2.2 | +1 major |
| typescript | 5.9.3 | 6.0.2 | +1 major |
| zod | 3.25.76 | 4.3.6 | +1 major |

### Minor Behind (7)
| Package | Current | Latest |
|---------|---------|--------|
| @anthropic-ai/sdk | 0.36.3 | 0.85.0 |
| @react-pdf/renderer | 4.3.2 | 4.4.0 |
| @tanstack/react-query | 5.95.2 | 5.96.2 |
| @tiptap/extension-placeholder | 3.21.0 | 3.22.3 |
| @tiptap/pm | 3.21.0 | 3.22.3 |
| @tiptap/react | 3.21.0 | 3.22.3 |
| @tiptap/starter-kit | 3.21.0 | 3.22.3 |

### Patch Behind (2)
| Package | Current | Latest |
|---------|---------|--------|
| next | 16.2.1 | 16.2.2 |
| postcss | 8.5.8 | 8.5.9 |

## Unused Code (Knip)

### Unused Dependencies (0)
Clean — no unused production dependencies.

### Unused DevDependencies (0)
Clean — no unused dev dependencies.

### Unused Exports (0)
Clean.

### Unused Files (0)
Clean.

## Extraneous Packages (npm ls)
4 extraneous packages found (likely leftover from a removed native module):
- @emnapi/core@1.9.1
- @emnapi/runtime@1.9.1
- @emnapi/wasi-threads@1.2.0
- @tybys/wasm-util@0.10.1

These are not in package.json but exist in node_modules. Not a runtime risk but adds noise.

## Notable Observations
- **@anthropic-ai/sdk 0.36.3 vs 0.85.0**: The Anthropic SDK is significantly behind (minor jumps but large gap) — may miss streaming improvements, model updates.
- **stripe 17 vs 22**: 5 major versions behind — breaking changes likely. LOW risk if existing integration works, but upgrade path is long.
- **Prisma 6 vs 7**: Major version behind — Prisma 7 has breaking changes. Monitor.
- **zod 3 vs 4**: Zod 4 is a breaking rewrite — not a trivial upgrade.
- **tailwindcss 3 vs 4**: TailwindCSS 4 is a complete rewrite — not a trivial upgrade.

## Raw Data
- npm audit: docs/audit/npm-audit-raw.json
- npm outdated: docs/audit/npm-outdated-raw.json
- Knip: docs/audit/knip-raw.json
- npm ls: docs/audit/npm-ls-raw.json
