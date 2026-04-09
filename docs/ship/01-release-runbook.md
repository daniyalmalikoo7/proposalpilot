# Release Runbook — ProposalPilot v0.1.0

_Generated: 2026-04-09 | Platform: Vercel + Supabase_

---

## Phase Gate Verification

| Report | Status | Critical Findings |
|--------|--------|-------------------|
| 01-qa-report.md | ✅ PASS | 0 |
| 02-performance-report.md | ✅ PASS | 0 (bundle warning is MEDIUM, non-blocking) |
| 03-security-report.md | ✅ PASS | 0 |
| 04-accessibility-report.md | ✅ PASS | 0 |
| 05-code-review.md | ✅ PASS | 0 |
| E2E suite | ✅ PASS | 20/24 passed, 4 data-conditional skips, 0 failures |

**Gate: GREEN — proceed to deploy.**

---

## Pre-Deploy Checklist

### Environment Variables (set in Vercel dashboard → Settings → Environment Variables)

| Variable | Source | Required |
|----------|--------|---------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection Pooling URI | ✅ |
| `DIRECT_URL` | Supabase → Settings → Database → Direct Connection URI | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys (production instance) | ✅ |
| `CLERK_SECRET_KEY` | Clerk → API Keys (production instance) | ✅ |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | ✅ |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | ✅ |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | ✅ |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` | ✅ |
| `GOOGLE_GEMINI_API_KEY` | Google AI Studio | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic Console (fallback AI) | ✅ |
| `VOYAGE_API_KEY` | Voyage AI dashboard | ✅ |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (live key) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint signing secret | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys (live publishable) | ✅ |
| `STRIPE_PRICE_STARTER` | Stripe → Products → Starter plan price ID | ✅ |
| `STRIPE_PRICE_GROWTH` | Stripe → Products → Growth plan price ID | ✅ |
| `STRIPE_PRICE_SCALE` | Stripe → Products → Scale plan price ID | ✅ |
| `STRIPE_PRICE_ENTERPRISE` | Stripe → Products → Enterprise plan price ID | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://proposalpilot.vercel.app` (or custom domain) | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `AI_PRIMARY_MODEL` | `gemini-2.5-flash` | ✅ |
| `AI_FALLBACK_MODEL` | `claude-3-haiku-20240307` | ✅ |
| `AI_MAX_TOKENS_PER_REQUEST` | `8192` | ✅ |
| `AI_MAX_COST_PER_USER_DAY` | `0.50` | ✅ |
| `AI_RATE_LIMIT_PER_MINUTE` | `10` | ✅ |
| `AI_CACHE_TTL_SECONDS` | `300` | ✅ |
| `LOG_LEVEL` | `warn` | ✅ |

**⚠️ Critical:** Use Clerk **production** instance keys — not development instance. Dev instance has usage limits and displays "Development Mode" warnings.

### Database Migrations

| Migration | Status | Command |
|-----------|--------|---------|
| Prisma schema (push) | Auto-applied | Handled by `prisma migrate deploy` or Supabase schema push |
| IVFFlat index | **MANUAL — must be applied before first AI query** | See below |

**Apply IVFFlat index (REQUIRED before launch):**
```bash
# Option A — via Prisma CLI
npx prisma db execute \
  --file prisma/manual-migrations/001_ivfflat_kbchunk_embedding.sql \
  --schema prisma/schema.prisma

# Option B — via psql (using production DATABASE_URL)
psql $DATABASE_URL -f prisma/manual-migrations/001_ivfflat_kbchunk_embedding.sql
```
Expected output: `CREATE INDEX` — verify with `\d "KbChunk"` showing `KbChunk_embedding_ivfflat_idx`.

Without this index, KB search does a full O(n) scan. Safe to skip for < 1,000 chunks but becomes a performance risk above that threshold.

### Third-Party Configuration

- [ ] **Stripe webhook endpoint registered:** `https://[your-domain]/api/webhooks/stripe`
  - Events to listen for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
- [ ] **Clerk production instance:** Confirm "Production" environment is active in Clerk dashboard, not "Development"
- [ ] **Clerk domain allowlist:** Add production domain to Clerk → Domains → Allowed origins
- [ ] **Monitoring health check:** `/api/health` endpoint verified (see 02-monitoring-setup.md)

### Pre-Deploy Checklist Summary

- [ ] All Phase 3 reports: ✅ PASS (verified above)
- [ ] All environment variables configured in Vercel
- [ ] IVFFlat migration applied to production DB
- [ ] Stripe webhook registered for production URL
- [ ] Clerk production instance active
- [ ] Monitoring configured (see docs/ship/02-monitoring-setup.md)
- [ ] Domain/DNS configured (Vercel auto-provisions SSL)
- [ ] SSL: active (Vercel auto — no action needed)

---

## Staging Verification

**Staging environment: NOT AVAILABLE**

Risk: No staging environment exists. This is a known gap. Mitigation:
1. Deploy to a preview Vercel deployment (auto-created on each PR/branch push) — use this as pseudo-staging
2. Verify the preview deployment against the production checklist below before merging to `main`
3. Risk accepted: v0.1.0 is a first launch to a small initial user base — rollback is fast (< 2 minutes on Vercel)

**Preview deploy verification (run on each branch before merging):**
```bash
# Push a branch to trigger Vercel preview
git push origin feature/your-branch
# Vercel auto-creates a preview URL — test at:
# https://proposalpilot-git-[branch]-[team].vercel.app
```

---

## Production Deployment

### Deployment Method

Vercel auto-deploys on every push to `main`. No custom deploy command needed.

### Steps

**Step 1 — Apply IVFFlat migration (one-time, before first deploy)**
```bash
npx prisma db execute \
  --file prisma/manual-migrations/001_ivfflat_kbchunk_embedding.sql \
  --schema prisma/schema.prisma
# Expected: CREATE INDEX
```

**Step 2 — Configure all environment variables in Vercel**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all variables from the table above
- Scope to `Production` environment

**Step 3 — Push to main**
```bash
git push origin main
```

**Step 4 — Monitor build**
- Expected build time: 4–6 minutes (Next.js build ~4.5s, Vercel overhead ~2–3 minutes)
- Build logs: Vercel Dashboard → Deployments → Latest
- Expected final log line: `✓ Compiled successfully`
- Build exit code: 0

**Step 5 — Post-deploy verification (immediately after deploy)**

Run this verification sequence within 5 minutes of deploy completing:

```bash
# 1. Health check
curl -s -o /dev/null -w "%{http_code}" https://[your-domain]/api/health
# Expected: 200

# 2. Landing page
curl -s -o /dev/null -w "%{http_code}" https://[your-domain]
# Expected: 200

# 3. Sign-in page
curl -s -o /dev/null -w "%{http_code}" https://[your-domain]/sign-in
# Expected: 200

# 4. Auth redirect (should redirect to sign-in, not 500)
curl -s -o /dev/null -w "%{http_code}" -L https://[your-domain]/dashboard
# Expected: 200 (after Clerk redirect)
```

**Step 6 — Manual smoke test (5 minutes)**
- [ ] Sign in with a test account
- [ ] Create a new proposal
- [ ] Navigate sidebar: Dashboard → Proposals → Knowledge Base — all load without errors
- [ ] Upload a KB document
- [ ] Confirm no console errors in browser DevTools (F12 → Console)

---

## Rollback Procedure

### Trigger Conditions (rollback immediately if ANY of these occur)

| Condition | Threshold | How to detect |
|-----------|-----------|---------------|
| Error rate spike | >1% of requests returning 500 in any 5-minute window | Vercel Analytics → Errors |
| P95 latency degradation | >2x pre-deploy baseline (baseline TBD at production) | Vercel Analytics → Web Vitals |
| Health check failure | 2 consecutive failures | UptimeRobot (see 02-monitoring-setup.md) |
| Auth broken | Any user reports cannot sign in | Manual verification |
| Critical path broken | Proposal creation or AI generation failing | Manual smoke test |

### Rollback Steps

**Option A — Vercel instant rollback (recommended, < 2 minutes)**
1. Go to Vercel Dashboard → Deployments
2. Find the last known-good deployment (before current)
3. Click `...` → `Promote to Production`
4. Verify rollback: re-run verification checks above
5. Confirm health check returns 200

**Option B — Git revert (if rollback needs code change)**
```bash
git revert HEAD --no-edit
git push origin main
# Vercel auto-deploys the revert commit
# Expected deploy time: 4–6 minutes
```

**Post-rollback:**
- Log the incident: what broke, what triggered rollback, rollback time
- Do NOT re-deploy until root cause is identified and fixed
- Communicate to any affected users via email if > 5 minutes of downtime

---

## Post-Deploy Monitoring

| Time | Check | Tool |
|------|-------|------|
| T+5min | Smoke test passes | Manual |
| T+30min | Error rate <0.1%, no alerts fired | Vercel Analytics |
| T+1hr | P95 latency stable, no new error types | Vercel Analytics |
| T+4hr | DB connection pool stable, no query errors | Supabase Dashboard |
| T+24hr | Check for user-reported issues, review error logs | Email + monitoring |

---

## Required Action Before Launch

> **⚠️ Decision gate:** This runbook is documentation-complete but cannot auto-execute production deployment. The human operator must:
> 1. Configure Vercel environment variables
> 2. Apply the IVFFlat migration against production DB
> 3. Register the Stripe webhook
> 4. Run `git push origin main`
>
> Estimated hands-on time: 20–30 minutes.
