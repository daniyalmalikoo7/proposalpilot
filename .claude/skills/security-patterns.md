# Security Patterns — Rescue Edition

## Authentication
- Every API route must verify authentication — check explicitly, don't assume middleware catches everything
- Every data query must filter by the authenticated user's organization/tenant ID (prevents IDOR)
- Server-only secrets stay server-side — never import server modules in client components

## Common Vulnerabilities to Check
- IDOR: can user A access user B's data by changing an ID in the URL?
- Missing auth: are there API routes without authentication checks?
- Prompt injection: do AI endpoints sanitize user input before including in prompts?
- XSS: is user-generated content rendered with dangerouslySetInnerHTML?
- Secret exposure: are API keys, tokens, or passwords in client-side code or git history?
- CSRF: are state-changing endpoints protected?
- Rate limiting: can endpoints be abused with rapid requests?

## Fix Priority
1. Verified secret leaks (CRITICAL — rotate immediately)
2. Authentication bypasses (CRITICAL)
3. IDOR vulnerabilities (HIGH)
4. Prompt injection (HIGH for AI apps)
5. Missing rate limiting (MEDIUM)
6. XSS vectors (MEDIUM)

## Verification
After fixing a security issue, verify by:
- Re-running Semgrep with the same config
- Testing the specific endpoint with curl (unauthenticated, wrong user, malformed input)
- Checking git diff to confirm the fix doesn't introduce new issues
