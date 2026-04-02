# Project State

_Last updated: 2026-04-02_

## Working

| Feature           | Notes                                     |
| ----------------- | ----------------------------------------- |
| Auth (Clerk)      | Sign-up, sign-in, session management      |
| Dashboard         | Proposal list, create/delete              |
| Proposal creation | Title, client, sections scaffold          |
| RFP upload        | mammoth DOCX → text extraction            |
| AI generation     | Gemini 2.5-flash SSE → Tiptap editor      |
| Auto-save         | Debounced tRPC mutation on content change |
| PDF export        | HTML → PDF via browser print pipeline     |

## Broken (wired, not verified)

| Issue                     | ID   | Details                                                               |
| ------------------------- | ---- | --------------------------------------------------------------------- |
| Confidence scores show 0% | B002 | Score persisted via updateSection mutation; rendering path untested   |
| Regenerate HTTP 400       | B003 | Zod fix applied (requirements min(1)→min(0)); not verified end-to-end |

## Not Built

| Feature              | ID   |
| -------------------- | ---- |
| KB upload pipeline   | B001 |
| DOCX export          | B008 |
| Playwright E2E tests | B004 |
| Vercel deployment    | B005 |
| Stripe billing       | B007 |
| Landing page         | —    |
| Product README       | B006 |

## Current Sprint

**Week 1 — Fix core features**

## Next Task

KB upload pipeline (B001)
