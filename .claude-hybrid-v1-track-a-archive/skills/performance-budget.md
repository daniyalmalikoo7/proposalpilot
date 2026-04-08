# ProposalPilot — Performance Budget (Principal Engineer Standard)

## The Rule

Every number below is a P95 target (95th percentile). Not average,
not median. 95% of users must experience this or better.

If any metric is red, it blocks deployment. No exceptions.

---

## Core Web Vitals (Google's bar — non-negotiable for SEO + UX)

| Metric                          | Green  | Yellow | Red (blocks deploy) |
| ------------------------------- | ------ | ------ | ------------------- |
| LCP (Largest Contentful Paint)  | <1.5s  | <2.5s  | >2.5s               |
| INP (Interaction to Next Paint) | <100ms | <200ms | >200ms              |
| CLS (Cumulative Layout Shift)   | <0.05  | <0.1   | >0.1                |
| TTFB (Time to First Byte)       | <100ms | <200ms | >400ms              |

Note: Google's "good" thresholds are LCP <2.5s, INP <200ms, CLS <0.1.
We target tighter than Google's bar. "Good" is not the goal. "Fast" is.

## API Response Times (tRPC endpoints)

| Operation | P50 | P95 | P99 (alert threshold) |
|-----------|-----|-----|--------------------| List queries (proposals, KB) | <100ms | <200ms | <500ms |
| Single record (proposal.get) | <150ms | <300ms | <800ms |
| KB vector search | <200ms | <500ms | <1s |
| Mutations (create, update) | <100ms | <200ms | <500ms |
| File upload + processing | <2s | <5s | <10s |

Any tRPC call exceeding 500ms at P95 is a bug, not a feature.

## AI Operations (external API calls — different budget)

| Operation                    | Target | Hard ceiling |
| ---------------------------- | ------ | ------------ |
| First SSE token from Gemini  | <2s    | <5s          |
| Full section generation      | <15s   | <30s         |
| Voyage AI embed (single)     | <500ms | <2s          |
| Voyage AI embed (batch 10)   | <2s    | <5s          |
| KB search (embed + pgvector) | <800ms | <2s          |

AI calls are inherently slower. Users tolerate this IF there's
immediate visual feedback (skeleton, progress indicator, streaming).
No user should ever stare at a frozen screen.

## Frontend Interaction Targets

| Interaction                        | Target        | Unacceptable |
| ---------------------------------- | ------------- | ------------ |
| Button click → visual feedback     | <50m>100ms    |
| Page navigation → skeleton visible | <200ms        | >500ms       |
| Editor keystroke → render          | <16ms (60fps) | >50ms        |
| Modal open/close                   | <100ms        | >200ms       |
| Auto-save → confirmation           | <500ms        | >2s          |
| Toast notification appear          | <100ms        | >200ms       |

## Bundle Budget

| Asset                     | Target | Hard ceiling |
| ------------------------- | ------ | ------------ |
| Total JS (gzipped)        | <300KB | <400KB       |
| Largest chunk             | <150KB | <200KB       |
| CSS total                 | <50KB  | <80KB        |
| First-load JS (per route) | <100KB | <150KB       |

## What "Slow" Means (enforce this in every code review)

- API >300ms with no loading indicator = BUG
- Page nav >500ms with no skeleton = BUG
- User action with zero feedback >100ms = BUG
- Any spinner lasting >3s without progress indication = BUG
- Database query without an index on filtered column = BUG

## Measurement (non-negotiable before deployment)

1. tRPC timing middleware: log P50/P95/P99 for every procedure
2. Slow query log: any Prisma query >200ms logged as WARNING
3. Next.js bundle analyzer: run on every il if budget exceeded
4. Lighthouse CI: run on every PR, fail if score <90
5. Real User Monitoring: Vercel Analytics or PostHog after deployment

## Database Performance Rules

- Every WHERE clause column has an @@index
- Every foreign key has an @@index
- No SELECT \* — always use select{} with only needed fields
- No N+1 — use include{} for relations, never loop queries
- pgvector: IVFFlat index on embedding columns (not brute force)
- Connection pooling: PgBouncer via Supabase (port 6543, not 5432)
