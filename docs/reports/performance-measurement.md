# tRPC Performance Measurement

_Generated: 2026-04-03_

## Middleware Status

The timing middleware is **already active** on all tRPC procedures. It was added in `src/server/trpc.ts` and applied to `publicProcedure` (the base for all procedures including `protectedProcedure` and `orgProtectedProcedure`).

```ts
// src/server/trpc.ts — lines 46–56
const timingMiddleware = t.middleware(async (opts) => {
  const start = performance.now();
  const result = await opts.next();
  const durationMs = Math.round(performance.now() - start);
  logger.info(`[PERF] ${opts.path}: ${durationMs}ms`, {
    procedure: opts.path,
    type: opts.type,
    durationMs,
  });
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
```

All `orgProtectedProcedure` calls (proposal.list, proposal.get, kb.list, kb.search) inherit this middleware via the procedure chain: `publicProcedure → protectedProcedure → orgProtectedProcedure`.

---

## Live Measurement Attempt

Live measurements require a running Supabase instance with `DATABASE_URL` and `DIRECT_URL` set. The dev environment does not have live DB credentials in this session; tRPC calls return auth/DB errors before the query executes.

Measurements will be recorded here once the Vercel deployment (B005) is live and the production database is accessible.

---

## Budget Targets

| Procedure       | P50 target | P95 target | Notes                                   |
| --------------- | ---------- | ---------- | --------------------------------------- |
| `proposal.list` | < 80 ms    | < 200 ms   | Paginated, indexed on `orgId + status`  |
| `proposal.get`  | < 100 ms   | < 250 ms   | Full include (sections, requirements)   |
| `kb.list`       | < 60 ms    | < 150 ms   | Simple filter on `orgId + isActive`     |
| `kb.search`     | < 300 ms   | < 800 ms   | pgvector IVFFlat + Voyage AI embed call |

---

## Notes

- `proposal.list` now fetches `sections.content` for each proposal (added in this session to compute real completion %). Monitor for latency increase if proposals have many sections — add a `take` limit on sections if needed.
- `kb.search` latency is dominated by the Voyage AI embedding round-trip (~100–200 ms). The pgvector IVFFlat scan is typically < 50 ms.
- All [PERF] logs are structured and routed through `src/lib/logger.ts`. Search for `procedure` field in your log aggregator (Datadog, Logtail, etc.) to build latency histograms in production.
