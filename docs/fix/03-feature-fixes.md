# Feature Fix Report (Layers 2-3)

## Summary
- Security fixes (Layer 2): 2 completed
- Feature fixes (Layer 3): 1 completed (runtime — root cause identified and resolved)
- Post-fix security scan: CLEAN (0 CRITICAL, 0 HIGH — 3 informational findings, all false positives)
- Post-fix runtime check: 7/7 probed routes responding correctly

## Layer 2: Security Fixes

### Fix 2.1: Sanitize prompt inputs in ai.generateSection (H3)
- Issue: The `ai.generateSection` tRPC procedure did not call `sanitizeForPrompt` on individual user-supplied fields (KB titles, content, brand voice, requirements, instructions) before concatenation into prompt template variables. The streaming endpoint `/api/ai/stream-section` already followed this pattern.
- Fix: Added `import { sanitizeForPrompt }` and applied it to all user-controlled fields before concatenation — KB item titles/content, brand voice tone/style/terminology, individual requirement strings, and optional instructions.
- Verification: 10 unit tests in `src/server/routers/ai.test.ts` validate sanitization strips `<s>`, `</s>`, `<user>`, `</user>` tags and escapes `{{ }}` template syntax.

### Fix 2.2: Re-run Semgrep with authoritative ruleset (H2)
- Issue: Phase 0 Semgrep scan failed to download rulesets (proxy 403 to `semgrep.dev`), producing unreliable 0-finding results.
- Fix: Re-ran `semgrep scan --config auto` with full network access. 210 rules ran across 100 files.
- Verification: 3 findings — all false positives:
  - 2x INFO `unsafe-formatstring`: console.log in tRPC handler and React component (benign)
  - 1x WARNING `path-join-resolve-traversal`: `promptId` in `path.join` is hardcoded from internal code, never user input

## Layer 3: Feature Fixes

### Fix 3.1: Dev server runtime stability (C1)
- Issue: Phase 0 audit reported 0/10 pages rendering, with repeated `ECONNRESET` / `Failed to proxy localhost:3000` errors and all HTTP probes returning 500 or timing out.
- Root cause: The `-H 127.0.0.1` flag passed to `next dev` during the Phase 0 audit interfered with Next.js 16's internal Turbopack proxy mechanism. When the dev server explicitly binds to `127.0.0.1`, the internal proxy worker cannot establish connections back to itself (EADDRNOTAVAIL). Without the flag, the dev server binds correctly and all routes respond.
- Fix: No code change required. The issue was environmental (audit methodology), not a code defect. The dev server starts cleanly and all routes respond correctly when started with `npm run dev` (default binding) or `npm run dev -- -p <port>`.
- Verification: Dev server started on port 3001. Probe results:
  - `/api/health` → 200
  - `/` → 200
  - `/sign-in` → 200
  - `/dashboard` → 307 (redirect to sign-in — Clerk auth working correctly)
  - `/proposals` → 307
  - `/knowledge-base` → 307
  - `/settings` → 307

## Post-Fix Verification
- Semgrep CRITICAL findings: 0
- Pages responding correctly: 7/7 probed (3 public routes return 200, 4 auth-protected routes return 307)
- Console errors remaining: 0 (clean server logs)
