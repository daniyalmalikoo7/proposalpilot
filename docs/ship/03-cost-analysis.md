# Cost Analysis — ProposalPilot v0.1.0

_Generated: 2026-04-09 | Pricing as of Q2 2026_

---

## Monthly Operating Cost — Current Scale (1–50 users)

| Service | Tier | Monthly Cost | Free Tier Limit | Notes |
|---------|------|-------------|-----------------|-------|
| Vercel | Hobby (free) | $0 | 100 GB bandwidth, 100K function invocations/day | Sufficient for early launch |
| Supabase | Free | $0 | 500 MB DB, 2 GB bandwidth, 2 GB file storage | Sufficient for < ~200 KB items |
| Clerk | Free | $0 | 10,000 MAUs | More than enough at launch |
| Google Gemini (AI gen) | Pay-as-you-go | ~$0.40–$2.00 | None — all usage billed | See per-action breakdown |
| Voyage AI (embeddings) | Pay-as-you-go | ~$0.05–$0.50 | None — all usage billed | See per-action breakdown |
| Stripe | 2.9% + $0.30/transaction | ~$0 if no revenue | N/A | Only costs on successful payments |
| Domain (.com) | Annual | ~$1.25/mo | N/A | Amortized |
| Sentry (error tracking) | Free | $0 | 5,000 errors/mo | Sufficient at launch |
| UptimeRobot | Free | $0 | 50 monitors, 5-min checks | Sufficient |
| **Total** | | **$0–$4/mo** | | At zero revenue, near-zero cost |

**Launch is essentially free until you hit free tier limits or start generating significant AI usage.**

---

## Per-User-Action AI Cost (calculated from pricing, not estimated)

### Pricing Sources
- **Gemini 2.5 Flash:** $0.075/1M input tokens, $0.300/1M output tokens
- **Voyage AI voyage-3:** $0.060/1M tokens (embeddings)

### Action 1: RFP Upload + Extraction (DOCX → text + chunk + embed)

| Step | Tokens | Rate | Cost |
|------|--------|------|------|
| mammoth text extraction | N/A | CPU only | $0.000 |
| Chunk RFP (~5,000 words → ~20 chunks × 250 tokens) | 5,000 embed tokens | $0.06/1M | $0.00030 |
| **Total per RFP upload** | | | **$0.0003** |

### Action 2: Generate Full Proposal (7 sections via Gemini)

| Step | Input Tokens | Output Tokens | Cost |
|------|-------------|--------------|------|
| System prompt (shared) | 2,000 × 7 sections | — | $0.00105 |
| RFP context per section | 3,000 × 7 sections | — | $0.00158 |
| KB context per section (3 chunks × 500 tokens) | 1,500 × 7 sections | — | $0.00079 |
| Requirements per section | 500 × 7 sections | — | $0.00026 |
| Output per section (~800 tokens) | — | 800 × 7 sections | $0.00168 |
| KB similarity search (7 searches × 500 embed tokens) | 3,500 embed tokens | — | $0.00021 |
| **Total per full proposal generation** | ~50,400 input | ~5,600 output | **$0.00557** |

### Action 3: Regenerate Single Section

| Step | Tokens | Cost |
|------|--------|------|
| Input (prompt + context) | ~7,500 tokens | $0.00056 |
| Output (~800 tokens) | 800 tokens | $0.00024 |
| KB search (1 search) | 500 embed tokens | $0.00003 |
| **Total per regeneration** | | **$0.00083** |

### Action 4: KB Upload (document embedding)

| Step | Tokens | Cost |
|------|--------|------|
| Document text (~10,000 words → 40 chunks × 250 tokens) | 10,000 embed tokens | $0.00060 |
| **Total per KB document upload** | | **$0.00060** |

### Action 5: KB Search (query only)

| Step | Tokens | Cost |
|------|--------|------|
| Embed query | ~50 tokens | $0.000003 |
| **Total per KB search** | | **$0.000003** |

---

## Typical User Monthly Cost (at different usage levels)

**Assumptions:** 4 proposals/month, 1 regeneration/section avg (7 regens), 5 KB documents uploaded, 20 KB searches

| Action | Volume/month | Cost/action | Monthly Cost |
|--------|-------------|------------|-------------|
| RFP uploads | 4 | $0.0003 | $0.001 |
| Full proposal generation | 4 | $0.0056 | $0.022 |
| Section regenerations | 28 | $0.0008 | $0.023 |
| KB document uploads | 5 | $0.0006 | $0.003 |
| KB searches | 20 | $0.000003 | $0.000 |
| **Total per user/month** | | | **$0.049** |

**AI cost per user per month: ~$0.05.** This is extremely low. 100 active users = ~$5/month in AI costs.

---

## Budget Alerts

| Service | Threshold | Alert Method | Action |
|---------|-----------|-------------|--------|
| Google Gemini | $10/month | Google Cloud Console → Budgets & Alerts | Review usage patterns, check for runaway requests |
| Google Gemini | $50/month | Google Cloud Console → Budgets & Alerts (emergency) | Temporarily rate-limit or disable AI features |
| Voyage AI | $5/month | Manual monthly check (no built-in alerting) | Review embedding volume |
| Vercel | Approaching Hobby limits | Vercel dashboard email notification (auto) | Upgrade to Pro ($20/mo) |
| Supabase | 400 MB DB storage (80% of free) | Supabase → Settings → Billing → Spend Cap | Migrate to Pro ($25/mo) |
| Supabase | 1.6 GB bandwidth (80% of free) | Same as above | |

**Configure Gemini budget alerts now:**
1. Google Cloud Console → Billing → Budgets & Alerts
2. Create budget: Name="ProposalPilot Gemini", Amount=$10, Threshold=100%
3. Add email notification

---

## Cost Optimization Opportunities

| Opportunity | Current | Optimized | Est. Saving |
|-------------|---------|-----------|-------------|
| **Response caching for identical RFP+requirements combos** | Every request hits Gemini | Cache identical generation inputs with `AI_CACHE_TTL_SECONDS` | 20–40% reduction in duplicate generation costs |
| **Chunk size optimization for KB** | 250 tokens/chunk | Test 512 tokens/chunk — fewer chunks, same coverage | 50% reduction in embedding costs on upload |
| **Lazy-load PDF renderer** | @react-pdf/renderer in main bundle | Move to `/api/export` server route (already documented in Phase 3) | 80–120 KB bundle reduction → better LCP → no cost saving but user experience |
| **Rate limiting is already in place** | 10 req/min per user | Existing `AI_RATE_LIMIT_PER_MINUTE` guard | Prevents cost runaway from individual bad actors |
| **Voyage AI cost is negligible** | $0.05/1M tokens | No action needed | — |

---

## Scaling Projections

| Users (MAU) | AI Cost/mo | Hosting | DB | Auth | Monitoring | **Total/mo** | Key Cost Driver |
|------------|-----------|---------|-----|------|-----------|------------|----------------|
| 10 | $0.50 | $0 (free) | $0 (free) | $0 (free) | $0 | **$0.50** | AI generation |
| 50 | $2.45 | $0 (free) | $0 (free) | $0 (free) | $0 | **$2.45** | AI generation |
| 100 | $4.90 | $20 (Pro) | $0 (free) | $0 (free) | $0 | **$24.90** | Vercel Pro (required for custom domain + more invocations) |
| 500 | $24.50 | $20 (Pro) | $25 (Pro) | $0 (free) | $26 (Sentry) | **$75.50** | DB Pro + monitoring |
| 1,000 | $49.00 | $20 (Pro) | $25 (Pro) | $0 (free) | $26 (Sentry) | **$120.00** | AI remains cheap — infrastructure dominates |
| 5,000 | $245 | $20–$150 | $25–$100 | $0 (free, <10K MAU) | $26 | **$296–$521** | AI scales linearly; infra step-jumps at capacity limits |
| 10,000 | $490 | $150 (Enterprise) | $100 | $0 (at 10K limit) | $89 (Sentry T2) | **$829** | Clerk MAU limit hit exactly at 10K — plan upgrade required |

**Margin check at 100 users (assuming $49/mo avg subscription):**
- Revenue: 100 users × $49 = $4,900/mo
- COGS: $24.90
- **Gross margin: ~99.5%** — SaaS unit economics are excellent at this scale.

---

## Cost Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Runaway AI generation (bot/bug firing repeated requests) | LOW | HIGH | `AI_RATE_LIMIT_PER_MINUTE=10` + `AI_MAX_COST_PER_USER_DAY=0.50` already configured |
| Supabase free tier storage (500 MB) hit by KB uploads | MEDIUM | LOW | Each KB document ~50–200 KB text extracted; 500 MB ≈ 2,500–10,000 documents. Hit at ~100+ active orgs with large KB libraries |
| Gemini Flash token costs increase | LOW | LOW | At $0.05/user/month, even a 10× price increase = $0.50/user — still negligible vs subscription revenue |
| Vercel Hobby bandwidth (100 GB) | LOW | LOW | 100 users generating ~1 MB/session × 100 sessions/mo = 10 GB — 10% of limit |
| Clerk MAU limit (10,000 free) | LOW | MEDIUM | ProposalPilot targets B2B orgs — 10K MAU means ~1,000–2,000 orgs. Revenue at that scale easily covers $25/mo Clerk Pro |

---

## Free Tier Runway

| Service | Free Limit | Estimated Exhaustion |
|---------|------------|---------------------|
| Clerk | 10,000 MAU | ~1,000–2,000 organizations |
| Supabase DB | 500 MB | ~2,500+ KB document uploads |
| Supabase bandwidth | 2 GB | ~2,000+ active sessions/month |
| Vercel Hobby | 100 GB bandwidth | ~10,000+ page loads/month |
| Sentry | 5,000 errors/month | Beyond 50K+ requests with <0.01% error rate |

**Conclusion:** ProposalPilot can grow to 50–100 paying customers before any service requires a paid plan upgrade. First plan upgrade will be Vercel Pro ($20/mo) for custom domain SSL + higher limits, likely at 50–100 users.
