# Active Blockers

_Updated: 2026-04-02_

| ID   | Severity | Title                                 | Status | Notes                                               |
| ---- | -------- | ------------------------------------- | ------ | --------------------------------------------------- |
| B002 | HIGH     | Confidence scores show 0%             | Open   | Persistence wired; display path unverified          |
| B003 | HIGH     | Regenerate HTTP 400                   | Open   | Zod fix applied (min(0)); not verified in browser   |
| B004 | HIGH     | Zero test coverage                    | Open   | No unit, integration, or E2E tests                  |
| B005 | CRITICAL | No Vercel deployment                  | Open   | App has never shipped to production                 |
| B006 | MEDIUM   | README describes workflow not product | Open   | No user-facing product description or setup guide   |
| B007 | HIGH     | No Stripe billing                     | Open   | No subscription or usage gating                     |
| B008 | MEDIUM   | DOCX export quality unknown           | Open   | Export implemented but output quality not validated |

---

## Resolution Log

_Resolved blockers moved here with date and fix summary._

| ID   | Date       | Fix Summary                                                                                                                                                        |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B001 | 2026-04-02 | KB pipeline verified end-to-end. Root cause: `voyage-large-2` deprecated → fixed to `voyage-3`. Re-embedded 202/202 chunks. Search and auto-RAG confirmed working. |
