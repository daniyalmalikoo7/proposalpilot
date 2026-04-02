# Vercel Deployment Checklist

## Prerequisites

- Vercel project linked to this repo (run `vercel link` or connect via Vercel dashboard)
- Supabase project created with `pgvector` extension enabled
- Clerk application created (Production instance)
- Google AI Studio API key for Gemini 2.5-flash
- Voyage AI API key for embeddings

---

## Environment Variables

Set all of the following in **Vercel → Project → Settings → Environment Variables**.
Mark each as **Production** (and **Preview** if you want preview deployments to work).

### Database (Supabase)

| Variable       | Description                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Supabase **pooled** connection string — port **6543**, mode `pgbouncer`. Used by Prisma at runtime. Example: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL`   | Supabase **direct** connection string — port **5432**. Used by Prisma for migrations. Example: `postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres`                                            |

> Both URLs are found in Supabase → Project → Settings → Database → Connection string.

### AI Providers

| Variable                | Description                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `GOOGLE_GEMINI_API_KEY` | Google AI Studio API key. Used for Gemini 2.5-flash section generation.             |
| `VOYAGE_API_KEY`        | Voyage AI API key. Used for `voyage-3` embeddings (KB ingestion + auto-RAG search). |

### Authentication (Clerk)

| Variable                            | Description                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — prefixed `pk_live_` for production. Exposed to browser. |
| `CLERK_SECRET_KEY`                  | Clerk secret key — prefixed `sk_live_` for production. Server-only.             |

> Found in Clerk dashboard → API Keys. Use the **Production** instance keys, not Development.

### Stripe (billing — not yet active, set when B007 is implemented)

| Variable                | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | Stripe secret key — prefixed `sk_live_` for production.                                     |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret — obtained from the Stripe dashboard webhook endpoint config. |

### Application

| Variable              | Description                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Full public URL of the deployed app, no trailing slash. Example: `https://proposalpilot.vercel.app` |

### Observability (optional)

| Variable     | Description                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `SENTRY_DSN` | Sentry Data Source Name. If set, errors are reported to Sentry. Safe to omit — app degrades gracefully. |

---

## Build Configuration

Vercel should auto-detect Next.js. Verify these settings in Vercel → Project → Settings → General:

| Setting          | Value                     |
| ---------------- | ------------------------- |
| Framework Preset | Next.js                   |
| Build Command    | `npm run build` (default) |
| Output Directory | `.next` (default)         |
| Install Command  | `npm ci` (default)        |
| Node.js Version  | 22.x                      |

`postinstall` in `package.json` runs `prisma generate` automatically as part of `npm ci` — no extra Vercel build command needed.

---

## Database Migration

Run migrations against the Supabase **direct** URL before the first deploy (and after schema changes):

```bash
DATABASE_URL="<direct-url>" npx prisma migrate deploy
```

Or via the Supabase dashboard SQL editor using the migration files in `prisma/migrations/`.

---

## Post-Deploy Verification

- [ ] Auth: sign up → sign in → org creation works
- [ ] Dashboard: proposal list loads
- [ ] RFP upload: DOCX upload extracts text
- [ ] AI generation: stream-section SSE completes within 60 s
- [ ] KB upload + search: chunk + embed + similarity search returns results
- [ ] PDF export: browser print pipeline produces output

---

## SSE Streaming Note

`src/app/api/ai/stream-section/route.ts` exports `maxDuration = 60`.
This requires the **Vercel Pro** plan. On the free Hobby plan, function execution is capped at 10 s and streaming will time out mid-generation.
