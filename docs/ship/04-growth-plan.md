# Growth Plan — ProposalPilot v0.1.0

_Generated: 2026-04-09_
_Cost reference: docs/ship/03-cost-analysis.md — AI cost ~$0.05/user/month_

---

## 1. Analytics Setup

### Tier 1 — Vercel Analytics (enable immediately, zero setup)

1. Vercel Dashboard → Your Project → Analytics → Enable
2. Tracks: page views, unique visitors, geographic breakdown, Web Vitals (LCP, CLS, TTFB)
3. **No code changes required** — Vercel injects automatically

### Tier 2 — PostHog (configure in Week 1, 30 minutes)

```bash
npm install posthog-js
```

Add to `src/app/layout.tsx`:
```tsx
import { PostHogProvider } from '@/components/providers/posthog-provider'
// Wrap <ClerkProvider> with <PostHogProvider>
```

Create `src/components/providers/posthog-provider.tsx`:
```tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    })
  }, [])
  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

Add env var: `NEXT_PUBLIC_POSTHOG_KEY=phc_[your-key]`

**Status:** ⚠️ Not yet configured — implement Week 1

### Custom Events to Track

| Event | Where to fire | Why |
|-------|--------------|-----|
| `proposal_created` | After `proposal.create` tRPC mutation succeeds | Core activation metric |
| `rfp_uploaded` | After `/api/upload` completes | Measures onboarding completion |
| `ai_generation_started` | Before streaming starts | Measures feature adoption |
| `ai_generation_completed` | After last section streams | Measures generation success rate |
| `kb_document_uploaded` | After `/api/upload/kb` completes | Measures KB engagement |
| `pdf_exported` | After export button click | Measures output completeness |
| `section_regenerated` | After regenerate button click | Measures iteration behavior |
| `subscription_started` | After Stripe checkout completes | Revenue event |

**Funnels to define in PostHog:**
1. **Activation funnel:** Sign up → Create proposal → Upload RFP → Generate sections → Export PDF
2. **Retention funnel:** Login → Create proposal (measures weekly retention)
3. **Revenue funnel:** Free user → View billing → Start checkout → Subscribe

**Configured and verified:** ⚠️ Pending (implement Week 1)

---

## 2. KPIs

All targets grounded in cost analysis: AI cost = $0.05/user/month, BEP = ~$25/user/month minimum.

| Metric | Target Month 1 | Target Month 3 | Measurement Tool |
|--------|---------------|---------------|-----------------|
| Weekly Active Users (WAU) | 10 | 50 | PostHog / Vercel Analytics |
| Proposals created per active user per week | 1 | 2 | PostHog `proposal_created` |
| Activation rate (sign-up → first proposal) | >50% | >65% | PostHog funnel |
| AI generation adoption (users who generate) | >70% of active users | >85% | PostHog `ai_generation_started` |
| KB adoption (users who upload ≥1 document) | >30% | >50% | PostHog `kb_document_uploaded` |
| Monthly churn rate | <15% | <8% | Stripe + manual |
| Conversion rate (free → paid) | >5% | >12% | Stripe / PostHog |
| MRR | $0 (pre-revenue) | $500 | Stripe Dashboard |
| P95 API latency | <500ms | <400ms | Vercel Analytics |
| Error rate | <0.5% | <0.1% | Sentry |

**Revenue note:** At $49/month Starter tier and 12% conversion at Month 3, 50 WAU → ~6 paying customers → ~$294 MRR. Break-even on full paid stack (~$120/mo at 1,000 users) happens well before that scale.

---

## 3. Feedback Collection

### In-App Feedback (implement in Week 2)

Add a feedback button to the dashboard footer:
```tsx
// Minimal implementation — opens mailto: or a Tally/Typeform embed
<a href="mailto:feedback@proposalpilot.com?subject=ProposalPilot feedback">
  Give feedback
</a>
```

For Week 2+: embed a Tally.so form (free tier) inside a slide-over panel — no backend needed.

### Error Reporting (after Sentry configured)

Sentry User Feedback widget: displays after unhandled errors, lets users describe what happened. Configure in Sentry dashboard → User Feedback → Enable.

### NPS Survey

**Defer to Month 2.** Too early at launch — users need at least 2 weeks of real usage before NPS is meaningful. Use Delighted or Typeform, target users who have created ≥2 proposals.

---

## 4. Launch Distribution

### Phase 1 — Soft Launch (launch day)

- [ ] **Direct outreach — 10 warm contacts:** Email 10 people who are or know professional services consultants, proposal writers, or bid managers. Personal email, not marketing blast. Ask for 15-minute feedback call.
  - Target: management consultants, IT services firms, architecture firms, engineering consultancies
  - Message: "I built a tool that drafts proposals from your RFP in minutes — would you try it and tell me what's wrong with it?"

- [ ] **LinkedIn post (personal profile):** Announce ProposalPilot with a screen recording of the generation flow (20-second Loom). Focus on the problem (proposals take 20+ hours) and the result (AI drafts in minutes, KB ensures consistency).

- [ ] **Twitter/X:** Same content as LinkedIn, shorter format.

### Phase 2 — Community Distribution (Week 1–2)

- [ ] **r/consulting** — post in community feedback/review thread, not a direct ad. Frame as "built a tool to solve a problem I kept seeing, what do you think?"
- [ ] **r/projectmanagement** — same approach
- [ ] **Indie Hackers** — "Show IH" post with honest metrics and what you learned building it
- [ ] **Product Hunt — prepare now, launch Week 2:**
  - Tagline: "AI proposal writer that learns from your best work"
  - Description: 3 sentences max — problem, solution, differentiator (KB makes it better over time)
  - Screenshots: 3 key screens (dashboard, editor mid-generation, exported PDF)
  - Maker comment: written and ready to post at midnight PST

### Phase 3 — Targeted Outreach (Month 1)

- [ ] **Clerk developer community** — ProposalPilot is built on Clerk; share as a real-world example
- [ ] **Vercel community** — similar to Clerk
- [ ] **B2B SaaS Slack groups:** Demand Gen, Proposify Alternatives communities
- [ ] **LinkedIn outreach:** Target "proposal manager", "bid manager", "business development" job titles at 50–500 person consulting firms

---

## 5. Iteration Triggers

These are hard decision rules — not vague directional guidance.

| Condition | Metric | Action |
|-----------|--------|--------|
| >5 users request same feature | PostHog: 5+ `feature_request` events with same tag | Prioritize for next sprint |
| Activation rate <30% (sign-up → first proposal) | PostHog funnel | Run user interviews with 3 non-converting users this week |
| Churn >15% monthly | Stripe subscription cancellations | Run exit survey with churned users; look for pattern |
| AI generation failure rate >5% | Sentry `ai_generation_*` error events | Emergency fix cycle — users who can't generate won't stay |
| AI cost per user exceeds $0.50/month | Google Cloud billing | Investigate caching gaps and consider context window reduction |
| Error rate >1% of requests | Sentry error volume | Declare incident — fix before any new features |
| Proposal generation P95 >3 seconds TTFB | Vercel Analytics | Investigate Gemini latency or streaming pipeline |
| Week 4: zero paid conversions | Stripe dashboard | Re-evaluate pricing or add a free tier with meaningful limits |
| Week 8: <5 WAU | Vercel Analytics | Pivot distribution channel — current approach is not working |

---

## 6. Post-Launch Review Schedule

| Week | Review | Decision |
|------|--------|----------|
| Week 1 | Activation funnel + error rate | Is the product usable? Any show-stoppers? |
| Week 2 | Feature usage heatmap + user feedback | What are people trying to do that we don't support? |
| Month 1 | Full KPI review vs targets | On track? Pivot distribution or double down? |
| Month 2 | Churn analysis + NPS launch | Why are people leaving (if any)? |
| Month 3 | Revenue review + cost analysis | Unit economics hold? What's next? |

---

## 7. Next Phase 0 Triggers (feeds back into rescue cycle)

The following conditions trigger a new Phase 0 audit of the codebase:

| Trigger | Threshold | Why |
|---------|-----------|-----|
| New feature sprint planned | Any significant feature addition | Baseline before building |
| Error rate spike | >2% sustained for 1 week | Rescue mode: something is broken |
| Performance degradation | P95 >1s for key routes | Architecture review needed |
| AI cost runaway | >$1/user/month | Cost optimization sprint |
| Scale milestone | 1,000 active users | Architecture may need to change |
| Security event | Any confirmed breach or vulnerability report | Emergency Phase 0 + Phase 2 |
