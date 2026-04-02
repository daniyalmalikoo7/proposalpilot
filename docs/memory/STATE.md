# Project State

_Last updated: 2026-04-02_

## Working

| Feature           | Notes                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| Auth (Clerk)      | Sign-up, sign-in, session management                                   |
| Dashboard         | Proposal list, create/delete                                           |
| Proposal creation | Title, client, sections scaffold — New Proposal button wired to dialog |
| Proposals list    | trpc.proposal.list wired — shows existing proposals with status + date |
| RFP upload        | mammoth DOCX → text extraction                                         |
| AI generation     | Gemini 2.5-flash SSE → Tiptap editor                                   |
| Auto-save         | Debounced tRPC mutation on content change                              |
| PDF export        | HTML → PDF via browser print pipeline                                  |
| KB upload         | /api/upload/kb → extract → chunk → embed (voyage-3)                    |
| KB search         | pgvector per-chunk similarity → KBSearchPanel — verified end-to-end    |
| KB auto-RAG       | stream-section auto-retrieves KB context when kbItemIds empty          |

## Broken (wired, not verified)

| Issue                     | ID   | Details                                                               |
| ------------------------- | ---- | --------------------------------------------------------------------- |
| Confidence scores show 0% | B002 | Score persisted via updateSection mutation; rendering path untested   |
| Regenerate HTTP 400       | B003 | Zod fix applied (requirements min(1)→min(0)); not verified end-to-end |

## Not Built

| Feature              | ID   |
| -------------------- | ---- |
| DOCX export          | B008 |
| Playwright E2E tests | B004 |
| Vercel deployment    | B005 |
| Stripe billing       | B007 |
| Landing page         | —    |
| Product README       | B006 |

## Current Sprint

**Week 1 — Fix core features**

## Current Task

Confidence scores fix (B002)

## Next Task

Regenerate HTTP 400 fix (B003)
