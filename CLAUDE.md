# ProposalPilot

AI-powered proposal generation platform. Extracts requirements from uploaded RFPs, matches them against a knowledge base using semantic search, and generates tailored proposal sections with citation tracking.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode enabled)
- **API**: tRPC with superjson transformer
- **Database**: PostgreSQL (Supabase) via Prisma ORM + pgvector for embeddings
- **Auth**: Clerk (multi-tenant, org-scoped)
- **Payments**: Stripe (webhook-verified)
- **AI**: Multi-model fallback chain (Google Gemini primary → Anthropic Claude fallback) + Voyage AI embeddings
- **Testing**: Jest (unit) + Playwright (e2e)
- **Deploy**: Vercel

## Architecture

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (Clerk middleware)
│   │   ├── dashboard/      # Proposal overview + stats
│   │   ├── proposals/      # Proposal list
│   │   ├── proposals/[id]/ # Tiptap editor + streaming AI generation
│   │   ├── knowledge-base/ # Document upload + semantic search
│   │   ├── onboarding/     # First-run wizard
│   │   └── settings/       # Org settings + brand voice profiles
│   ├── (auth)/             # Auth routes (sign-in, sign-up via Clerk)
│   ├── (marketing)/        # Landing page
│   └── api/
│       ├── ai/stream-section/   # SSE streaming endpoint
│       ├── upload/               # RFP + KB document ingestion
│       ├── webhooks/stripe/      # Signature-verified webhook handler
│       ├── health/               # Health check
│       └── trpc/[trpc]/          # tRPC endpoint
├── components/
│   ├── atoms/              # Primitives (Button, Input, Skeleton)
│   ├── molecules/          # Composed (ProposalCard, StatusBadge)
│   ├── organisms/          # Complex (Sidebar, KBSearchPanel, RequirementsSidebar)
│   └── templates/          # Layouts (AppShell)
├── server/
│   └── routers/            # tRPC routers: ai, billing, kb, proposal, settings
└── lib/
    ├── ai/                 # Fallback chain, prompt templates, services
    │   └── prompts/base.ts # sanitizeForPrompt() lives here
    ├── middleware/          # Auth, rate limiting
    ├── services/           # Business logic
    ├── trpc/               # tRPC client + server setup
    ├── types/              # Shared TypeScript types
    └── utils/              # Helpers (chunker, logger, etc.)
```

## Data model (12 Prisma models)

Core entities: `Organization` (tenant boundary, Clerk org + Stripe customer) → `User` → `Proposal` → `RFPSource` → `ExtractedRequirement` → `ProposalSection` (citations + confidence score).

Knowledge pipeline: `KnowledgeBaseItem` → `KbChunk` (vector(1024) embeddings via Voyage AI).

Supporting: `BrandVoice` (per-org tone/style), `ComplianceMatrix`, `WinLossRecord`, `ProcessedWebhookEvent` (Stripe idempotency).

All data queries are org-scoped via `orgId` to prevent cross-tenant access.

## Commands

```bash
npm run dev            # Dev server (Turbopack)
npm run build          # Production build
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint (src/ only)
npm test               # Jest unit tests
npm run test:unit      # Jest (src/ path only)
npm run test:e2e       # Playwright E2E
npm run test:coverage  # Jest with coverage
npm run db:migrate     # Prisma migrate dev
npm run db:seed        # Prisma seed
npm run db:studio      # Prisma Studio GUI
npm run db:generate    # Prisma generate
```

## Conventions

- **File naming**: kebab-case for all files
- **Function naming**: camelCase
- **Components**: Atomic design (atoms → molecules → organisms → templates)
- **API security**: Every tRPC data procedure uses `orgProtectedProcedure` — never `publicProcedure` for data access
- **Prompt security**: All user text entering LLM prompts goes through `sanitizeForPrompt()` from `src/lib/ai/prompts/base.ts`
- **Error handling**: `TRPCError` with appropriate codes (NOT_FOUND, UNAUTHORIZED, BAD_REQUEST)
- **Imports**: `@/` path alias maps to `src/`
- **Test pattern**: Mock external deps at module level, inline procedures to avoid ESM issues, test org-scoping separately from business logic

## Integrations

| Service | Provider | Required |
|---------|----------|----------|
| Auth | Clerk | Yes |
| Database | Supabase PostgreSQL | Yes |
| Vector search | pgvector extension | Yes |
| LLM | Google Gemini (primary) | Yes |
| LLM fallback | Anthropic Claude | Optional |
| Embeddings | Voyage AI | Optional (fallback to full-text) |
| Payments | Stripe | Yes (webhook + prices) |
| Error monitoring | Sentry | Optional |
| Analytics | PostHog + Vercel Analytics | Optional |

## Security invariants

1. **Org-scoping**: Every `findFirst`/`findMany` on tenant data includes `orgId: ctx.internalOrgId`
2. **Prompt sanitization**: All user text → `sanitizeForPrompt()` before LLM — strips XML injection tags, escapes `{{template}}` syntax
3. **Webhook verification**: Stripe webhooks are signature-verified via `stripe.webhooks.constructEvent()`
4. **No client secrets**: Only `NEXT_PUBLIC_*` vars are exposed to the browser

## What you should never do

- Skip org-scoping on any data query — every data access must filter by `orgId`
- Pass unsanitized user input to LLM prompts — always use `sanitizeForPrompt()`
- Use `as any` or `@ts-ignore` — fix the actual type
- Add `NEXT_PUBLIC_` prefix to secret keys
- Use `db push` in production — use `prisma migrate deploy`
- Commit `.env` or any file containing secrets
- Add new dependencies without checking if existing code already solves the problem
