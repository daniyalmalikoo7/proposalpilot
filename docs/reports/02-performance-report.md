# Performance Report

## Summary
| Metric | Phase 0 Baseline | Current | Target | Status |
|--------|-----------------|---------|--------|--------|
| Lighthouse Performance | — (not run) | — (server not started) | ≥70 | ⚠️ untested |
| Lighthouse Accessibility | — (not run) | — (server not started) | ≥80 | ⚠️ untested |
| Lighthouse Best Practices | — (not run) | — (server not started) | ≥80 | ⚠️ untested |
| API P95 (reads) | — (not run) | — (server not started) | <500ms | ⚠️ untested |
| Client JS Bundle (gzipped) | — (not run) | 467 KB | <300KB | ❌ exceeds target |
| Build time | 5.7s | 4.5s | — | ✅ improved |

Note: Lighthouse and API latency require a running server. Server start was denied in both Phase 0 and Phase 3 audits. These metrics must be measured in production deployment (Phase 4) or by the user running the server locally.

## Lighthouse Results per Page
Not available — server not started. Deferred to Phase 4 / post-deployment.

## API Response Times
Not available — server not started. Based on static analysis:
- All tRPC procedures use Prisma with appropriate `select` projections (25 occurrences) to minimize data transfer
- All critical read queries have database indexes (see Database Index section)
- No N+1 patterns detected — relations are fetched via `include` on the same query, not in loops

## Bundle Analysis
| Chunk | Size (uncompressed) | Size (gzipped) | Notes |
|-------|--------------------|--------------------|-------|
| `0~.-hv1hhzv-q.js` | 481 KB | 146 KB | Largest chunk — likely tRPC + React core |
| `00nvzi6qb_-1r.js` | 221 KB | 69 KB | Second largest — likely tiptap editor |
| `03~yq9q893hmn.js` | 110 KB | — | Third largest |
| `0bu--cci7w4sz.js` | 107 KB | — | Fourth largest |
| `08.271z_g4flz.js` | 99 KB | — | Fifth largest |
| All other chunks | <79 KB each | — | |

**Total gzipped JS: ~467 KB** — exceeds 300 KB target by ~167 KB.

Primary contributors to bundle bloat:
1. **@tiptap/***: Rich text editor suite (tiptap/react + starter-kit + placeholder) — unavoidable for proposal editor feature
2. **@react-pdf/renderer**: PDF generation on client — could be moved server-side to reduce bundle
3. **tRPC client + superjson**: ~40-60 KB typical

## Database Index Assessment
Prisma schema has comprehensive indexing:
| Table | Indexes Present |
|-------|----------------|
| Organization | `clerkOrgId` |
| Proposal | `orgId`, `orgId + status`, `userId` |
| ProposalSection | `proposalId`, `proposalId + order` |
| KnowledgeBaseItem | `orgId + type`, `orgId + isActive` |
| KbChunk | `itemId` |

All org-scoped queries (`where: { orgId }`) are indexed. No missing indexes detected.

## Performance Issues Found

### ⚠️ MEDIUM: Bundle size 467 KB gzipped exceeds 300 KB target
- **Root cause:** tiptap editor suite is large by nature; @react-pdf/renderer loaded on client
- **Recommendation:** Move `@react-pdf/renderer` to a server-side API route (`/api/export`) with `next/dynamic({ ssr: false })` to lazy-load only when user requests export. Expected saving: ~80-120 KB
- **Not a blocker for rescue** — feature works, just suboptimal on first load

### ✅ No unoptimized `<img>` tags
No raw `<img>` tags found in production components — all images use Next.js `next/image` or are CSS-based.

### ✅ No N+1 queries detected
All Prisma queries use `include` or `select` to batch-fetch relations in single queries. No loops with individual DB calls found.

## Phase 0 Comparison
| Metric | Phase 0 | Current | Delta |
|--------|---------|---------|-------|
| Build time | 5.7s | 4.5s | -1.2s improved |
| TypeScript errors | 0 | 0 | same |
| ESLint errors | 2 | 0 | -2 resolved |
| Build deprecation warnings | 1 (middleware) | 0 | -1 resolved |
| Bundle size | not measured | 467 KB gzip | new baseline |
| Lighthouse | not measured | not measured | pending live server |
| API latency | not measured | not measured | pending live server |
