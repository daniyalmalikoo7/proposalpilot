# Project State

_Last updated: 2026-04-15

## Working

| Feature                    | Notes                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Auth (Clerk)               | Sign-up, sign-in, session management                                                     |
| Dashboard                  | Proposal list, create/delete                                                             |
| Proposal creation          | Title, client, sections scaffold — New Proposal button wired to dialog                   |
| Proposals list             | trpc.proposal.list wired — shows existing proposals with status + date                   |
| Proposal delete            | Trash icon (hover) + confirmation dialog — proposal.delete tRPC mutation                 |
| Dashboard rows (all pages) | All 5 rows render — mapProposal defensive against null sections/content, variants stable |
| RFP upload                 | mammoth DOCX → text extraction                                                           |
| Skip button debounce       | RFPUploadPanel skip disabled while isCreatingSections — prevents duplicate sections      |
| AI generation              | Gemini 2.5-flash SSE → Tiptap editor                                                     |
| Auto-save                  | Debounced tRPC mutation on content change                                                |
| PDF export                 | HTML → PDF via browser print pipeline                                                    |
| KB upload                  | /api/upload/kb → extract → chunk → embed (voyage-3)                                      |
| KB search                  | pgvector per-chunk similarity → KBSearchPanel — verified end-to-end                      |
| KB auto-RAG                | stream-section auto-retrieves KB context when kbItemIds empty                            |
| KB document detail         | Card expand shows content preview (first 500 chars) + skeleton while loading             |
| Confidence scores          | Persisted + displayed — verified 100% on Scope of Work with KB (B002)                    |
| Regenerate                 | Passes requirements correctly end-to-end — verified, no HTTP 400 (B003)                  |
| Section delete             | Trash icon on section header (hover) + confirmation overlay — deleteSection tRPC mutation |

## Broken (wired, not verified)

_None — all known bugs resolved._

## Not Built

| Feature              | ID   |
| -------------------- | ---- |
| Playwright E2E tests | B004 |
| Vercel deployment    | B005 |
| Product README       | B006 |
| Stripe billing       | B007 |
| DOCX export          | B008 |
| Landing page         | —    |

## Current Sprint

**Week 2 — Playwright E2E tests + Vercel deployment**

## Current Task

Playwright E2E tests (B004)

## Next Task

Vercel deployment (B005)
