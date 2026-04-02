# Session Log

---

## S001 — Pre-memory-system bootstrap

**Date**: pre-2026-04-02
**Status**: Completed (pre-memory-system)

### Built

- Project scaffold: Next.js 16.2.1, tRPC v11, Prisma v6, Supabase, Clerk auth
- Dashboard: proposal list, create, delete
- Proposal editor: Tiptap + section scaffold
- RFP upload: mammoth DOCX → text extraction → requirements parsing
- AI generation: Gemini 2.5-flash SSE → streaming into Tiptap
- Auto-save: debounced tRPC mutation
- PDF export: HTML → browser print pipeline
- Security hardening pass

### Left Broken / Not Built

- KB pipeline (no upload, embed, or retrieval)
- Confidence score display (wired, unverified)
- No tests
- No deployment

---

## S002 — Core fixes + memory system

**Date**: 2026-04-02
**Status**: Completed

### Built / Fixed

- Confidence score persistence: `updateSection` mutation now accepts `confidenceScore`; `handleGenerateComplete` fires it immediately after generation
- Tooltip on disabled Generate button (Radix UI `tooltip.tsx` atom added)
- Zod fix: `requirements` schema `min(1)` → `min(0)` to unblock Regenerate
- CLAUDE.md corrected: Next.js version, AI provider, storage provider
- Memory system initialized: `docs/memory/` populated (STATE, DECISIONS, BLOCKERS, SESSION_LOG)

### Left Broken / Not Built

- Confidence score display path unverified (B002)
- Regenerate fix unverified in browser (B003)
- KB pipeline still not built (B001)
- No tests (B004)
- No Vercel deployment (B005)

---

## S003 — KB pipeline (B001)

**Date**: 2026-04-02
**Branch**: fix/kb-pipeline
**Status**: RESOLVED — verified end-to-end in browser

### Accomplished

- **Task 1 — Per-chunk embeddings**: Added `KbChunk` model (vector(1024), cascade-delete). Removed single doc-level embedding from `KnowledgeBaseItem`. `searchSimilar` now JOINs `KbChunk → KnowledgeBaseItem`, aggregates MIN(distance) per document. `kb.create` chunks content, `createMany` chunk rows, batch-embeds via Voyage AI in one round-trip.
- **Task 2 — Auto-RAG**: `stream-section` route now auto-retrieves KB context when `kbItemIds` is empty — embeds `sectionTitle + first 3 requirements` (≤200 words), calls `searchSimilar(limit: 5)`, uses returned doc IDs. Manual selections bypass retrieval unchanged. Both paths logged. Failure degrades gracefully.
- **Task 3 — KBSearchPanel wiring**: Search → select → generate chain was already wired internally. Added two missing UX pieces: top-bar KB toggle button (shows/hides panel, displays selection count), and per-section "N KB" badge in `ProposalEditor` header.
- **Task 4 — Upload flow consolidation**: New `/api/upload/kb` route handles full server-side pipeline (extract → chunk → embed). `KBUploadForm` now makes one POST with `file + type + title`, drops `kb.create` tRPC mutation. No document text travels over the wire. `/api/upload` unchanged (RFP flow).

### Bugs Found and Fixed During Verification

- **New Proposal button broken**: `proposals/page.tsx` was a Server Component placeholder — `NewProposalDialog` existed but was never imported. Fixed: added `"use client"`, wired `useState` + `onClick`.
- **Proposals list empty**: page never called `trpc.proposal.list`. Fixed: wired query, added loading/empty states, clickable rows navigate to editor.
- **Voyage AI model deprecated**: `voyage-large-2` → API returned 4xx, caught silently by `.catch()`. Fixed: upgraded to `voyage-3` (same 1024 dims). Added response body to error message for future diagnostics.
- **Re-embed existing chunks**: 202 existing chunks had null embeddings from broken model. One-off script re-embedded all with rate-limit handling (3 RPM free tier). Verified: 202/202 chunks populated.
- **`tsconfig.tsbuildinfo` not gitignored**: added to `.gitignore`.

### Key Decision

`voyage-large-2` was the original embedding model — treat it as **never use this model name again**. Always use `voyage-3` or later.
