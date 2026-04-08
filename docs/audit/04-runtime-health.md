# Runtime Health Audit

## Summary
- Dev server: NOT STARTED — permission denied during audit (background process not permitted)
- Pages: 10/10 compiled successfully (all dynamic routes in build output)
- API routes: 5/5 compiled successfully — no build-time errors
- Console errors: 0 detected at build time (1 non-blocking Node.js warning about --localstorage-file)
- Lighthouse: NOT RUN — requires running server
- Build deprecation: middleware file convention deprecated (should rename to proxy)

## Method Note

The dev server could not be started during this audit session. Runtime results are derived from:
1. The successful production build output (all 15 routes compiled cleanly)
2. Static analysis of page components for error states, loading states, and error boundaries
3. Middleware/proxy analysis for route protection behavior

Live Playwright/Lighthouse testing is deferred — a future validation run should confirm runtime behavior with an active server.

## Page Results (from build artifacts)

| Route | HTTP Status | Renders Content | Console Errors | Screenshot |
|-------|------------|-----------------|----------------|------------|
| / | Compiled ✅ | Landing page — static | 0 (build) | Not taken |
| /dashboard | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /knowledge-base | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /onboarding | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /proposals | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /proposals/[id] | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /settings | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /settings/brand-voice | Compiled ✅ | Dynamic (auth required) | 0 (build) | Not taken |
| /sign-in/[[...sign-in]] | Compiled ✅ | Clerk auth UI | 0 (build) | Not taken |
| /sign-up/[[...sign-up]] | Compiled ✅ | Clerk auth UI | 0 (build) | Not taken |

All routes are dynamic (server-rendered on demand). No static routes except landing page.

## Broken Pages (detail)
None detected from build artifacts.

## API Route Results (from static analysis)

| Route | Method | Status | Valid Response | Invalid Input Handling |
|-------|--------|--------|---------------|----------------------|
| /api/ai/stream-section | POST | Compiled ✅ | SSE stream | Zod validation → 400 |
| /api/trpc/[trpc] | GET/POST | Compiled ✅ | tRPC response | tRPC error handler |
| /api/upload | POST | Compiled ✅ | File upload | Auth check → 401 |
| /api/upload/kb | POST | Compiled ✅ | KB item creation | Auth check → 401, Zod → 400 |
| /api/webhooks/stripe | POST | Compiled ✅ | Billing sync | Signature verify → 400 |

## Build Deprecation Warning
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```
File: `src/middleware.ts` — should be renamed to `src/proxy.ts` per Next.js 16 convention. Non-breaking but generates build warning.

## Console Errors (unique, sorted by frequency)
| Error Message | Pages Affected | Count |
|--------------|----------------|-------|
| Warning: `--localstorage-file` was provided without a valid path | Build process | 1 |

One non-blocking Node.js warning at build time. Not a runtime page error.

## Error State Coverage (Static Analysis)

### Error Boundaries
- `src/app/(app)/error.tsx` — catches errors in all (app) group routes
- `src/app/(app)/proposals/[id]/error.tsx` — extra boundary for proposal detail

### Loading States
- Skeleton/loading patterns found in: knowledge-base/page.tsx, proposals/page.tsx
- No `loading.tsx` files found — loading states are inline within components (not Next.js route-level)
- Missing loading.tsx for: dashboard, onboarding, settings, settings/brand-voice

### Empty States
- Not verified without runtime — cannot determine from static analysis

## Lighthouse Scores
Not available — server not started.

| Page | Performance | Accessibility | Best Practices | SEO |
|------|------------|--------------|---------------|-----|
| / | — | — | — | — |

## Screenshots
None taken — server not started during audit.

## Raw Data
- Lighthouse: docs/audit/lighthouse-raw.json (not generated)
- Build output: docs/audit/build-raw.txt
