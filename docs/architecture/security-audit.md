# Security Audit Report — ProposalPilot

**Date**: 2026-03-30
**Auditor**: Senior Application Security Engineer (AI-assisted)
**Scope**: Full codebase audit — authentication, authorization, input validation, AI/LLM security, data protection, infrastructure, business logic
**Commit**: f81cf35 (master)

---

## Findings

### SEC-001: Missing Security Headers (CSP, HSTS, X-Frame-Options)

- **Severity**: High
- **CVSS Score**: 6.1
- **Description**: The application does not configure any HTTP security headers. No Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers are set.
- **Attack Scenario**: An attacker embeds the application in an iframe on a malicious site (clickjacking), or injects inline scripts if any future XSS vector is introduced. Without HSTS, users can be downgraded to HTTP via MITM.
- **Affected Code**: `next.config.ts` (entire file — no `headers()` function defined)
- **Remediation**:
  ```typescript
  // next.config.ts
  const nextConfig: NextConfig = {
    // ... existing config ...
    poweredByHeader: false,
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=()",
            },
          ],
        },
      ];
    },
  };
  ```
- **Verification**: Deploy and check headers with `curl -I` or securityheaders.com.

---

### SEC-002: Stripe Webhook Missing Idempotency / Event Deduplication

- **Severity**: High
- **CVSS Score**: 7.5
- **Description**: The Stripe webhook handler at `/api/webhooks/stripe/route.ts` processes events without checking if they have already been processed. Stripe retries webhooks on network failures, which could cause duplicate plan upgrades or inconsistent billing state.
- **Attack Scenario**: A network timeout causes Stripe to retry a `checkout.session.completed` event. The handler runs twice, potentially double-updating organization state. In a worst case, a subscription update event replays and corrupts plan/limit data.
- **Affected Code**: `src/app/api/webhooks/stripe/route.ts:34-68`
- **Remediation**:
  1. Create a `ProcessedWebhookEvent` table with a unique constraint on Stripe event ID.
  2. Before processing, check if event ID exists. If so, return 200 immediately.
  3. Wrap event processing + dedup insert in a database transaction.
  ```typescript
  const existing = await db.processedWebhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }
  await db.$transaction(async (tx) => {
    await tx.processedWebhookEvent.create({
      data: { stripeEventId: event.id },
    });
    await handleEvent(event, tx);
  });
  ```
- **Verification**: Send the same webhook event twice using Stripe CLI (`stripe trigger`); confirm only one database update occurs.

---

### SEC-003: Inconsistent Organization Authorization (IDOR Risk)

- **Severity**: High
- **CVSS Score**: 7.4
- **Description**: Authorization checks for organization membership are inconsistent across routes. Some routes explicitly verify `ctx.orgId === input.orgId` (e.g., `updateSection`), while others accept client-provided `orgId` without verifying it matches the authenticated user's org context (e.g., `proposal.create`, `kb.create`, `kb.list`).
- **Attack Scenario**: An authenticated user with `orgId=A` sends a request with `input.orgId=B`. Routes that don't verify `ctx.orgId === input.orgId` would allow the user to create proposals or knowledge base items in another organization.
- **Affected Code**:
  - `src/server/routers/proposal.ts:20-41` (create — no org check)
  - `src/server/routers/proposal.ts:46-77` (list — filters by client-provided orgId)
  - `src/server/routers/kb.ts:29-68` (create — no org check)
  - `src/server/routers/kb.ts:73-111` (list — no org check)
  - `src/server/routers/kb.ts:117-189` (search — no org check)
  - `src/server/routers/kb.ts:194-213` (delete — no org check)
- **Remediation**: Create a reusable tRPC middleware that enforces `ctx.orgId === input.orgId` for all org-scoped procedures:
  ```typescript
  const orgProtectedProcedure = protectedProcedure.use(
    async ({ ctx, input, next }) => {
      const orgId = (input as { orgId?: string })?.orgId;
      if (!ctx.orgId || ctx.orgId !== orgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Organization access denied.",
        });
      }
      return next({ ctx });
    },
  );
  ```
  Apply this middleware to all org-scoped routes.
- **Verification**: Authenticate as user in org A, send request with `orgId` of org B, confirm 403 response.

---

### SEC-004: Rate Limiting Not Enforced

- **Severity**: High
- **CVSS Score**: 6.5
- **Description**: Environment variables `AI_RATE_LIMIT_PER_MINUTE=20` and `AI_MAX_COST_PER_USER_DAY=1.00` are defined in `.env.example`, and a `RateLimitError` class exists in `src/lib/types/errors.ts`, but no rate limiting middleware is implemented. The AI streaming endpoint and file upload endpoint are unprotected.
- **Attack Scenario**: An attacker with valid credentials sends hundreds of AI generation requests per minute, exhausting the Anthropic API budget and causing denial of service for other users. File upload endpoint could be abused for storage exhaustion.
- **Affected Code**:
  - `src/app/api/ai/stream-section/route.ts` (no rate limit)
  - `src/app/api/upload/route.ts` (no rate limit)
  - `src/server/routers/ai.ts` (all AI procedures unthrottled)
- **Remediation**: Implement rate limiting middleware. For Next.js API routes, use an in-memory or Redis-backed limiter:

  ```typescript
  // src/lib/middleware/rate-limit.ts
  import { RateLimitError } from "@/lib/types/errors";

  const windowMs = 60_000;
  const buckets = new Map<string, { count: number; resetAt: number }>();

  export function checkRateLimit(userId: string, limit: number): void {
    const now = Date.now();
    const bucket = buckets.get(userId);
    if (!bucket || now > bucket.resetAt) {
      buckets.set(userId, { count: 1, resetAt: now + windowMs });
      return;
    }
    bucket.count++;
    if (bucket.count > limit) {
      throw new RateLimitError(
        `Rate limit exceeded: ${limit} requests per minute`,
      );
    }
  }
  ```

  For production, replace in-memory map with Redis (upstash/ratelimit or similar).

- **Verification**: Send 21 requests within 60 seconds; confirm the 21st returns 429.

---

### SEC-005: File Upload Missing Organization Verification

- **Severity**: Medium
- **CVSS Score**: 5.3
- **Description**: The file upload endpoint at `/api/upload/route.ts` validates `userId` but does not check `orgId`. Uploaded files are not scoped to an organization.
- **Attack Scenario**: An authenticated user uploads files that could be associated with any organization if the subsequent processing pipeline doesn't re-verify org membership.
- **Affected Code**: `src/app/api/upload/route.ts:61-65`
- **Remediation**:
  ```typescript
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }
  ```
- **Verification**: Remove org membership from test user, attempt upload, confirm 401 response.

---

### SEC-006: Inconsistent Environment Variable Access

- **Severity**: Medium
- **CVSS Score**: 5.0
- **Description**: While `src/lib/config.ts` provides validated environment variable access via `requireEnv()`, several files bypass this and read `process.env` directly, some with dangerous empty-string fallbacks.
- **Attack Scenario**: If `STRIPE_SECRET_KEY` is unset, `process.env.STRIPE_SECRET_KEY ?? ""` creates a Stripe client with an invalid key that silently fails or produces confusing errors instead of failing fast at startup.
- **Affected Code**:
  - `src/app/api/ai/stream-section/route.ts:20` — `process.env.ANTHROPIC_API_KEY`
  - `src/lib/ai/fallback-chain.ts:12` — `process.env.ANTHROPIC_API_KEY`
  - `src/app/api/webhooks/stripe/route.ts:46` — `process.env.STRIPE_SECRET_KEY ?? ""`
  - `src/server/routers/billing.ts:21` — `process.env.STRIPE_SECRET_KEY ?? ""`
- **Remediation**: Import all secrets from the centralized `env` object in `src/lib/config.ts`. Remove all `?? ""` fallbacks for secrets.
  ```typescript
  import { env } from "@/lib/config";
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  ```
- **Verification**: Unset `STRIPE_SECRET_KEY`, start the app, confirm it crashes at startup with a clear error message instead of silently proceeding.

---

### SEC-007: No PII Redaction Layer for AI Prompts

- **Severity**: Medium
- **CVSS Score**: 4.7
- **Description**: User-uploaded RFP documents may contain personally identifiable information (names, emails, phone numbers, addresses). This content is passed directly to the Anthropic API without PII detection or redaction. While tenant isolation prevents cross-org leakage, PII is still sent to a third-party API.
- **Attack Scenario**: A client uploads an RFP containing employee names and contact details. This data is sent to Anthropic's API, creating compliance risk under GDPR, CCPA, or similar regulations.
- **Affected Code**:
  - `src/lib/ai/services/generate-section.ts:58-96` (KB context injected into prompts)
  - `src/lib/ai/prompts/base.ts:70-85` (sanitization handles injection, not PII)
- **Remediation**: Add a PII detection/redaction pre-processing step before context injection:
  ```typescript
  export function redactPII(text: string): string {
    return text
      .replace(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        "[EMAIL REDACTED]",
      )
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE REDACTED]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN REDACTED]");
  }
  ```
  For comprehensive coverage, consider a dedicated PII detection library.
- **Verification**: Upload an RFP containing test PII, inspect AI request logs, confirm PII is redacted.

---

### SEC-008: npm Dependency Vulnerabilities

- **Severity**: Medium
- **CVSS Score**: 5.9
- **Description**: `npm audit` reports 7 vulnerabilities (3 high, 4 low). The high-severity `effect` vulnerability (AsyncLocalStorage context contamination under concurrent load) is a transitive dependency of Prisma and could impact database operations under heavy load.
- **Attack Scenario**: Under concurrent request load, the `effect` library bug could cause Prisma to use the wrong AsyncLocalStorage context, potentially leaking data across tenant boundaries in rare conditions.
- **Affected Code**: `package.json` (transitive: `prisma` -> `@prisma/config` -> `effect`)
- **Remediation**:
  1. Run `npm audit fix` for auto-fixable vulnerabilities.
  2. Monitor Prisma releases for `effect` dependency update.
  3. Pin Prisma version if upgrade introduces breaking changes.
- **Verification**: Run `npm audit` and confirm vulnerability count decreases.

---

### SEC-009: Development Error Boundaries Expose Details

- **Severity**: Low
- **CVSS Score**: 3.1
- **Description**: Client-side error boundaries log full error objects to `console.error` in all environments, not just development. While this doesn't expose data to other users, it could leak internal details in browser developer tools.
- **Attack Scenario**: A user inspects browser console after an error and sees internal stack traces, database query details, or internal API paths.
- **Affected Code**:
  - `src/app/(app)/error.tsx:16`
  - `src/app/(app)/proposals/[id]/error.tsx:16`
- **Remediation**: Conditionally log based on environment:
  ```typescript
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
  ```
- **Verification**: Trigger an error in production build, confirm console shows no internal details.

---

### SEC-010: AI Output Logging May Contain User Data

- **Severity**: Low
- **CVSS Score**: 3.5
- **Description**: When hallucination guards block AI output, the first 200 characters of the output are logged (`output.slice(0, 200)`). This could include user-provided content or generated PII.
- **Attack Scenario**: AI generates output containing user data; guard blocks it; the data appears in structured logs, potentially violating data retention policies.
- **Affected Code**: `src/lib/ai/guards/hallucination.ts:93`
- **Remediation**: Redact or omit the output preview from logs, or apply the same PII redaction from SEC-007:
  ```typescript
  logger.error("AI output blocked by hallucination guard", {
    guard: guard.name,
    // Remove outputPreview or redact it
  });
  ```
- **Verification**: Trigger a guard failure, inspect logs, confirm no user data appears.

---

### SEC-011: Missing `poweredByHeader: false` in Next.js Config

- **Severity**: Info
- **CVSS Score**: 0.0
- **Description**: Next.js sends an `X-Powered-By: Next.js` header by default, revealing the framework in use.
- **Attack Scenario**: Reconnaissance — attacker knows the framework and can target known Next.js vulnerabilities.
- **Affected Code**: `next.config.ts`
- **Remediation**: Add `poweredByHeader: false` to Next.js config.
- **Verification**: `curl -I <app-url>` — confirm no `X-Powered-By` header.

---

## Executive Summary

ProposalPilot demonstrates **strong foundational security practices** for an early-stage SaaS application:

- **Authentication** is properly delegated to Clerk with server-side enforcement
- **AI security** is notably well-implemented with prompt injection defense, hallucination guards, output validation, cost tracking, and model fallback chains
- **Input validation** is comprehensive via Zod schemas on all routes
- **SQL injection** risk is effectively zero with Prisma ORM and parameterized raw queries
- **XSS** risk is effectively zero with no `dangerouslySetInnerHTML` usage
- **File upload** security is excellent with MIME whitelisting, magic byte validation, and size limits

However, **four high-severity gaps must be addressed before production deployment**:

1. Missing HTTP security headers (clickjacking, MIME sniffing, HSTS)
2. Stripe webhook replay vulnerability (no idempotency/deduplication)
3. Inconsistent organization authorization (IDOR risk across multiple routes)
4. No rate limiting enforcement on AI and upload endpoints

---

## Top 5 Priorities

| Priority | Finding                                          | Severity | Effort    |
| -------- | ------------------------------------------------ | -------- | --------- |
| 1        | SEC-003: Fix org authorization across all routes | High     | 2-3 hours |
| 2        | SEC-002: Add Stripe webhook deduplication        | High     | 3-4 hours |
| 3        | SEC-001: Add security headers                    | High     | 30 min    |
| 4        | SEC-004: Implement rate limiting                 | High     | 2-3 hours |
| 5        | SEC-006: Centralize env variable access          | Medium   | 1 hour    |

---

## Positive Findings

1. **Clerk authentication** — industry-standard auth provider, properly integrated with server-side verification
2. **AI prompt injection defense** — multi-layered: input sanitization, system/user separation, template escaping, 10K character cap
3. **Hallucination guard pipeline** — 5 guards (JSON validity, non-empty, fabricated URLs, confidence threshold, custom context) with block/warn severity levels
4. **Zod validation everywhere** — all API inputs validated with strict schemas before processing
5. **Parameterized SQL** — even raw vector queries use `$1`, `$2` placeholders with validated numeric inputs
6. **Structured logging** — JSON logs in production, no `console.log`, typed error hierarchy
7. **File upload security** — MIME whitelist, magic byte verification, 50MB size limit, in-memory processing (no disk writes)
8. **Cost tracking** — per-request budget enforcement, model-specific pricing, structured cost logging
9. **Stripe webhook signature verification** — HMAC-SHA256 validation before processing any event
10. **Tenant isolation** — `orgId` foreign keys on all data models with database-level scoping
