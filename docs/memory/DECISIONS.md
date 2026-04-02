# Architectural Decisions

_Never contradict entries in this file without an explicit superseding decision._

---

## D001 — Core Stack

**Decision**: Next.js 16.2.1, tRPC v11, Prisma v6, Supabase (PostgreSQL + pgvector + Storage), Gemini 2.5-flash, Voyage AI, Tiptap, Clerk, Stripe

**Rationale**: Full-stack TypeScript with minimal ops overhead. Supabase covers DB, auth fallback, and file storage in one platform.

---

## D002 — Embeddings: Voyage AI + pgvector

**Decision**: Use Voyage AI for text embeddings; store vectors in pgvector on Supabase.

**Rationale**: Best retrieval quality for domain-specific professional services content. Keeps vector search co-located with relational data — no separate vector DB to operate.

---

## D003 — Auth: Clerk

**Decision**: Clerk for authentication and session management.

**Rationale**: Fastest Next.js integration path. Built-in UI components, webhooks, and org support reduce auth surface area to near-zero.

---

## D004 — Rich Text: Tiptap

**Decision**: Tiptap as the proposal editor.

**Rationale**: ProseMirror-based, fully extensible, production-ready. Supports streaming AI content insertion and custom extensions for future brand/template features.

---

## D005 — DOCX Parsing: mammoth

**Decision**: mammoth for server-side DOCX → HTML/text extraction.

**Rationale**: Lightweight, zero native dependencies, serverless-friendly. Sufficient for RFP text extraction without a heavy document processing service.

---

## D006 — Memory System: File-based checkpoints in docs/memory/

**Decision**: Persist project state, decisions, blockers, and session logs as Markdown files in `docs/memory/`, committed to the repo.

**Rationale**: Agent-readable across sessions without external tooling. Git history provides automatic versioning and audit trail.
