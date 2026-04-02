# Active Blockers

_Updated: 2026-04-02_

| ID   | Severity | Title                                 | Status | Notes                                               |
| ---- | -------- | ------------------------------------- | ------ | --------------------------------------------------- |
| B004 | HIGH     | Zero test coverage                    | Open   | No unit, integration, or E2E tests                  |
| B005 | CRITICAL | No Vercel deployment                  | Open   | App has never shipped to production                 |
| B006 | MEDIUM   | README describes workflow not product | Open   | No user-facing product description or setup guide   |
| B007 | HIGH     | No Stripe billing                     | Open   | No subscription or usage gating                     |
| B008 | MEDIUM   | DOCX export quality unknown           | Open   | Export implemented but output quality not validated |

---

## Resolution Log

_Resolved blockers moved here with date and fix summary._

| ID   | Date       | Fix Summary                                                                                                                                                         |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B001 | 2026-04-02 | KB pipeline verified end-to-end. Root cause: `voyage-large-2` deprecated → fixed to `voyage-3`. Re-embedded 202/202 chunks. Search and auto-RAG confirmed working.  |
| B002 | 2026-04-02 | Confidence score display verified in browser. Score hit 100% on Scope of Work with KB context (up from 40% without). Persistence + rendering path confirmed.        |
| B003 | 2026-04-02 | Regenerate verified end-to-end. Root cause: Regenerate button had no requirements guard — fired `start()` with empty array. Fixed: same disabled check as Generate. |
