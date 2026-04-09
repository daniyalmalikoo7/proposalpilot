# Monitoring Setup — ProposalPilot v0.1.0

_Generated: 2026-04-09_

---

## Summary

| Layer | Tool | Status | Notes |
|-------|------|--------|-------|
| Health check | `/api/health` (new endpoint) | ✅ Built & deployed | Returns `{status: "ok", timestamp, version}` |
| Uptime monitoring | UptimeRobot (free tier) | ⚠️ Configure manually | 5-minute check interval |
| Error tracking | Vercel Analytics (built-in) | ✅ Auto-enabled on Vercel | Function error logs available |
| Full error tracking | Sentry | ⚠️ Not yet configured | See setup instructions below |
| Performance | Vercel Web Vitals | ✅ Auto-enabled on Vercel | LCP, FID, CLS tracked |
| Custom analytics | PostHog | ⚠️ Not yet configured | See setup instructions below |

---

## 1. Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-09T14:30:00.000Z",
  "version": "0.1.0"
}
```

**Implementation:** `src/app/api/health/route.ts` — stateless, no DB dependency, always fast.

**Verification:**
```bash
curl -s https://[your-domain]/api/health | jq .
# Expected: {"status":"ok","timestamp":"...","version":"0.1.0"}
```

---

## 2. Uptime Monitoring

**Tool:** UptimeRobot (free — 50 monitors, 5-min check interval)

**Setup (5 minutes):**
1. Create account at uptimerobot.com
2. Click "Add New Monitor"
3. Type: `HTTP(s)`
4. Friendly Name: `ProposalPilot - Health Check`
5. URL: `https://[your-domain]/api/health`
6. Monitoring Interval: `5 minutes`
7. Alert Contact: your email
8. Keyword to check: `"ok"` (confirms response body is correct, not just 200)

**Alert rule:** 2 consecutive failures → email notification (UptimeRobot default).

**Alternative:** Vercel Cron (configured in `vercel.json`) can ping the health endpoint and alert via Vercel monitoring.

---

## 3. Error Tracking

### Tier 1 — Vercel Built-In (available immediately, no setup)

- Function error logs: Vercel Dashboard → Functions → Logs
- Runtime errors: Vercel Dashboard → Deployments → Latest → Build Logs
- Web Vitals: Vercel Dashboard → Analytics (enable Vercel Analytics in dashboard)

**Limitation:** No stack traces, no grouping, no alerting threshold. Requires manual checking.

### Tier 2 — Sentry (recommended, configure before public launch)

**Setup (20 minutes):**

```bash
# 1. Install Sentry SDK
npm install @sentry/nextjs

# 2. Run Sentry wizard (auto-configures Next.js)
npx @sentry/wizard@latest -i nextjs
# Follow prompts — creates sentry.client.config.ts, sentry.server.config.ts,
# instrumentation.ts, and updates next.config.ts
```

**Environment variables to add in Vercel:**
```
SENTRY_DSN=https://[your-dsn]@o[org].ingest.sentry.io/[project]
SENTRY_ORG=[your-org-slug]
SENTRY_PROJECT=[your-project-name]
NEXT_PUBLIC_SENTRY_DSN=[same as SENTRY_DSN — used client-side]
```

**Verify by triggering a test error:**
```bash
curl https://[your-domain]/api/health
# Then in Sentry: Issues → Recent → confirm test error appears
```

**Alert rules to configure in Sentry:**
| Condition | Threshold | Channel |
|-----------|-----------|---------|
| New issue | Any new error type | Email |
| Issue frequency | >10 occurrences in 5 min | Email |
| Critical error (status 500) | Any occurrence | Email + Slack if available |

---

## 4. Performance Monitoring

### Vercel Web Vitals (auto-enabled)

Available at: Vercel Dashboard → Analytics → Web Vitals

| Metric | Target | Source |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | <2.5s | Vercel Analytics |
| FID / INP (Interaction to Next Paint) | <200ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | <0.1 | Vercel Analytics |
| TTFB (Time to First Byte) | <800ms | Vercel Analytics |

**Note:** Phase 3 Lighthouse data was not collected (server not started during validation). The Vercel production deployment will provide the first real performance baseline.

### Critical API Routes to Monitor

| Route | Endpoint | Expected P95 | Alert Threshold |
|-------|----------|-------------|-----------------|
| Proposal list | `POST /api/trpc/proposal.list` | <300ms | >600ms |
| Proposal get | `POST /api/trpc/proposal.get` | <300ms | >600ms |
| KB list | `POST /api/trpc/kb.list` | <400ms | >800ms |
| KB search (pgvector) | `POST /api/trpc/kb.search` | <500ms | >1000ms |
| AI section stream | `POST /api/ai/stream-section` | <2000ms TTFB | >4000ms TTFB |

**Note:** Alert thresholds above are 2× estimated baselines. Once production data is available (week 1), update thresholds based on actual P95 measurements.

---

## 5. Alert Rules

| Condition | Threshold | Channel | Status |
|-----------|-----------|---------|--------|
| Downtime | Health check fails 2× in a row | UptimeRobot email | ⚠️ Configure UptimeRobot |
| Error spike | >5 new errors in 5 minutes | Sentry email | ⚠️ Configure Sentry |
| P95 latency | >2× baseline on critical routes | Sentry performance alert | ⚠️ Configure Sentry |
| Build failure | Any failed Vercel deployment | Vercel email (auto) | ✅ Auto |
| DB quota | Supabase storage >80% | Supabase email alerts | ⚠️ Configure in Supabase |

---

## 6. Monitoring Checklist

### Daily (5 minutes)
- [ ] Check UptimeRobot dashboard — any outages in last 24h?
- [ ] Check Vercel Analytics — any error spikes?
- [ ] Check Sentry — any new error types?

### Weekly (15 minutes)
- [ ] Review Vercel Web Vitals trends — LCP, CLS improving or degrading?
- [ ] Review Sentry error trends — resolved vs new errors
- [ ] Check Supabase DB size growth — on track with projections?
- [ ] Review AI API costs in Google AI Studio — compare to budget

### Monthly (30 minutes)
- [ ] Review cost vs budget (see docs/ship/03-cost-analysis.md)
- [ ] Check free tier limits for all services
- [ ] Review P95 latency trends — any gradual degradation?
- [ ] Update Sentry alert thresholds if baseline has shifted
- [ ] Evaluate if pgvector IVFFlat `lists` parameter needs retuning (increase at 100K+ KB chunks)

---

## 7. Monitoring Setup Priority

| Priority | Action | Time | Blocks |
|----------|--------|------|--------|
| P0 — BEFORE deploy | Health check endpoint | ✅ Done | Uptime monitoring |
| P0 — BEFORE deploy | UptimeRobot uptime monitor | 5 min | Knowing about outages |
| P0 — BEFORE deploy | Vercel Analytics enabled | 2 min (dashboard toggle) | Performance baseline |
| P1 — Week 1 | Sentry error tracking | 20 min | Error debugging |
| P2 — Week 2 | Sentry performance monitoring | 10 min | Latency alerting |
| P2 — Week 2 | PostHog product analytics | 30 min | User behavior data |

**Minimum viable monitoring for launch day:** Health check + UptimeRobot + Vercel Analytics.
Full observability target: add Sentry by end of Week 1.
