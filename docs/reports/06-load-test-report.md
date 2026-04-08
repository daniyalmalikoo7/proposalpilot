# Load Test Report

## Summary
- Breaking point: NOT MEASURED — server start was denied during validation phase
- Bottleneck: STATIC ANALYSIS ONLY — see architectural assessment below
- P95 at 10/50/100 users: not measured
- Recovery: not measured

## Test Configuration
- Tool: none — server could not be started in this environment
- Mode: N/A
- Machine: macOS Darwin 24.4.0, Apple Silicon (local dev machine)
- Database: PostgreSQL via Supabase connection pooling (remote — aws-1-ap-northeast-2.pooler.supabase.com)

**This report is based on static architectural analysis only.** Live load testing must be performed against the deployed production instance (Phase 4) or by the user running the server locally.

## Architectural Load Capacity Assessment (Static Analysis)

### Scaling Constraints Identified

| Component | Configuration | Scaling Ceiling | Evidence |
|-----------|--------------|-----------------|---------|
| Rate limiter | In-memory Map, 20 AI req/min/user | Single-instance only — does not work across multiple Next.js instances/pods | `src/lib/middleware/rate-limit.ts` — `Map` is process-local |
| Database | Supabase connection pooler (PgBouncer) | ~100 concurrent connections (Supabase free/pro tier default) | `prisma/schema.prisma` datasource uses pooled URL |
| AI streaming | Gemini API — 20 req/min limit per user | Hard limit — each SSE session holds connection open for up to 60s | `export const maxDuration = 60` in stream-section route |
| Static assets | Served by Next.js via Vercel/CDN (assumed) | Effectively unlimited | .next/static/ output exists |
| tRPC reads | Stateless, Prisma connection-pooled | Scales horizontally | No shared state in read procedures |

### Bottleneck Analysis (Predicted)
| Component | Under Load | Evidence |
|-----------|-----------|---------|
| App server (CPU) | Expected: moderate at 50 users, high at 100+ | Next.js SSR with tRPC + Prisma per request |
| App server (memory) | Expected: stable (no detected memory leaks, rate-limiter Map has periodic cleanup) | `setInterval` cleanup at 5-min intervals |
| Database | Expected: bottleneck at ~80-100 concurrent connections | Supabase pooled connections; each request opens 1 connection |
| AI API | Expected: rate-limited per user at 20/min | Gated by Gemini quota — multiple users multiplied |
| Rate limiter | Does not work across multiple server instances | In-memory only — horizontal scaling breaks rate limiting |

## Tier 1: Smoke (1 user, 30s)
Not run — server not started. Expected: all routes <500ms based on build performance (4.5s full build indicates fast runtime compilation; Prisma queries with indexes should be <100ms P95 for reads).

## Tier 2: Light (10 users, 60s)
Not run. Predicted: read endpoints (proposals list, KB list) <200ms P95. AI streaming excluded (quota gated).

## Tier 3: Moderate (50 users, 120s)
Not run. Predicted first degradation: database connection pool exhaustion (~80 connections) before app server CPU. Each concurrent request holds a Prisma connection for the query duration.

## Tier 4: Stress (100+ users, 60s)
Not run. Predicted breaking point: 80-100 concurrent users hitting database-bound endpoints. AI endpoints would be independently limited by Gemini quota well before this.

## Recovery Test
Not run.

## Recommendations
1. **[HIGH] Replace in-memory rate limiter with Redis-backed limiter** — The current `rate-limit.ts` implementation is process-local and does not work correctly when the app is horizontally scaled (multiple pods). Use `@upstash/ratelimit` with Redis for production correctness. The `rate-limit.ts` file already contains this recommendation in a comment (`// Production: replace with Redis-backed limiter`). Expected impact: enables safe horizontal scaling.

2. **[MEDIUM] Add Prisma connection pool monitoring** — Set `connection_limit` explicitly in DATABASE_URL and instrument query durations via Prisma `$on('query', ...)` to detect connection pool exhaustion under load. Current config uses default pool sizing. Expected impact: prevents silent connection exhaustion.

3. **[LOW] Add Vercel/CDN caching headers to static API responses** — tRPC queries that return org-scoped read data (proposals list, KB list) could be cached with short TTLs using `stale-while-revalidate` where appropriate. Expected impact: reduces database hits for repeated reads at moderate load.
