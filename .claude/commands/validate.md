You are a QA Engineer performing end-to-end functional validation on a running application.
Unlike /review (which reads code) or /test (which writes test files), you actually RUN the app and verify every feature works.

## Your Mission

Start the app, hit every endpoint, test every user flow, and report what's actually broken vs. what actually works.

## Pre-Validation

1. Check that .env.local exists and has all required values (not placeholders):

   ```bash
   grep -c "YOUR-PASSWORD\|PASTE\|sk_test_\.\.\.\|pk_test_\.\.\." .env.local
   ```

   If any placeholders found → STOP and report them.

2. Check database connectivity:

   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

3. Check that migrations are applied:

   ```bash
   npx prisma migrate status
   ```

4. Verify the app builds:

   ```bash
   npm run build 2>&1 | tail -20
   ```

5. Start the dev server if not running:
   ```bash
   npm run dev &
   sleep 5
   ```

## Functional Validation Checklist

Test each flow by making actual HTTP requests with curl or by reading the codebase to verify wiring.

### Auth Flow

- [ ] Middleware exists at src/middleware.ts and protects app routes
- [ ] Sign-in page exists at /sign-in
- [ ] Sign-up page exists at /sign-up
- [ ] ClerkProvider wraps the app in layout.tsx
- [ ] Org creation flow exists for new users (no org → create org → dashboard)

### Database Connectivity

- [ ] PrismaClient has datasourceUrl configured
- [ ] All models exist in the database (run: `npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname='public';"`)
- [ ] CRUD operations work (try creating a test record)

### API Layer (tRPC)

- [ ] tRPC endpoint responds: `curl -s http://localhost:3000/api/trpc | head -5`
- [ ] Each router is registered: check src/server/routers/ for proposal, kb, ai, billing, settings
- [ ] Auth context extracts Clerk credentials (check src/server/trpc.ts)
- [ ] Org-scoped queries use ctx.internalOrgId, not hardcoded values

### Dashboard (/dashboard)

- [ ] Page imports and uses trpc.proposal.list (not hardcoded data)
- [ ] Empty state renders when no proposals exist
- [ ] Stats computed from real data
- [ ] "+ New Proposal" button is wired to a dialog/modal
- [ ] Proposal rows are clickable (Link to /proposals/[id])

### Knowledge Base (/knowledge-base)

- [ ] Upload dropzone calls /api/upload
- [ ] Upload creates KB items via trpc.kb.create
- [ ] Grid shows items from trpc.kb.list (not hardcoded)
- [ ] Search calls trpc.kb.search

### Proposal Editor (/proposals/[id])

- [ ] Loads proposal data from trpc.proposal.get
- [ ] Requirements sidebar populated from database
- [ ] Generate button calls AI (check if Gemini/Anthropic SDK is properly configured)
- [ ] Auto-save via trpc.proposal.updateSection
- [ ] Export produces real files

### Onboarding (/onboarding)

- [ ] Step 1 uploads to KB
- [ ] Step 2 calls brand voice analysis
- [ ] Step 3 generates a demo section
- [ ] Completion redirects to dashboard

### Settings (/settings)

- [ ] Org name loads from database
- [ ] Save updates database
- [ ] Billing opens Stripe portal

### File Upload (/api/upload)

- [ ] Endpoint exists and accepts multipart/form-data
- [ ] Auth check present (rejects unauthenticated)
- [ ] PDF extraction works
- [ ] DOCX extraction works

### AI Pipeline

- [ ] Gemini API key configured and reachable
- [ ] Fallback chain has proper error handling
- [ ] Prompt templates exist in docs/prompts/
- [ ] Hallucination guards are wired into the generation flow

### Environment & Config

- [ ] All required env vars present and not placeholders
- [ ] src/lib/config.ts validates required vars
- [ ] CSP headers allow Clerk, Gemini, and Stripe domains
- [ ] Rate limiting middleware active on AI and upload routes

## Output Format

```
FUNCTIONAL VALIDATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORKING:
  ✅ [Feature] — verified by [method]
  ✅ [Feature] — verified by [method]

BROKEN:
  ❌ [Feature] — [what's wrong] — [exact file:line] — [fix needed]
  ❌ [Feature] — [what's wrong] — [exact file:line] — [fix needed]

NOT TESTABLE (needs manual browser interaction):
  ⚠️ [Feature] — [why]

ENVIRONMENT ISSUES:
  🔧 [Issue] — [fix]

FIX PRIORITY (ordered):
  1. [Most critical — blocks everything else]
  2. [Next most important]
  3. ...
```

After producing the report, ask: "Should I fix all broken items now?"
If yes, fix them all in one pass, then re-run the validation to confirm.

$ARGUMENTS
