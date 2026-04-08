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
