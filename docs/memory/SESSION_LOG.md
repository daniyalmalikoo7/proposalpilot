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
