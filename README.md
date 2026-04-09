# ProposalPilot

**Turn RFPs into winning proposals in minutes, not days.**

ProposalPilot is an AI-powered proposal engine for consulting firms, agencies, and professional services companies. Upload an RFP, let the AI extract every requirement, match against your company's knowledge base of past wins, and generate a tailored, grounded proposal — with confidence scores showing exactly how well each section covers the requirements.

No hallucinated content. Every response is anchored in your real past work via RAG.

---

## How It Works

1. **Upload your RFP** — Drop in a DOCX file. Mammoth extracts the full text server-side.
2. **Requirements extracted automatically** — Gemini 2.5 Flash identifies and structures every must-have and should-have.
3. **Matched against your knowledge base** — Voyage AI embeddings + pgvector (HNSW index) retrieve the most relevant past proposals and case studies from your KB.
4. **Proposal generated with confidence** — Sections stream into the Tiptap rich text editor, each with a confidence score showing KB coverage. Regenerate any section with one click.
5. **Export** — PDF export from the browser. DOCX export on the roadmap.

---

## Features

- **RFP Analysis** — Paste or upload a DOCX/PDF RFP; structured requirements extracted automatically
- **Requirement Tracking** — Every requirement surfaced, scored, and tracked through the proposal
- **KB-Grounded Generation** — Responses anchored in your real past work via RAG, not hallucinated
- **Confidence Scoring** — Each section shows how well AI-generated content covers requirements
- **One-Click Regeneration** — Regenerate any section with updated context or knowledge
- **Rich Text Editing** — Tiptap editor for formatting, review, and refinement before export
- **PDF Export** — Print-ready export directly from the browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| API | tRPC v11 (end-to-end type safety) |
| Database | PostgreSQL + pgvector via Supabase (HNSW index) |
| AI | Gemini 2.5 Flash (generation + requirement extraction) |
| Embeddings | Voyage AI (document + query embeddings) |
| Auth | Clerk |
| Editor | Tiptap (rich text) |
| Styling | Tailwind CSS + shadcn/ui |
| ORM | Prisma v6 |

---

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/daniyalmalikoo7/proposalpilot.git
cd proposalpilot
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the required variables below

# 3. Set up the database
npx prisma migrate dev

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key |
| `VOYAGE_API_KEY` | Voyage AI embeddings key |

---

## Current Status

ProposalPilot is under active development. The core pipeline (RFP upload → requirement extraction → KB matching → proposal generation) is functional. Currently being rescued and hardened for production using [claude-workflow-rescue](https://github.com/daniyalmalikoo7/claude-workflow-rescue).

### What works
- RFP upload and text extraction (DOCX via mammoth)
- AI requirement extraction (Gemini 2.5 Flash)
- Proposal section generation with KB grounding
- Tiptap rich text editor with streaming
- PDF export
- Clerk authentication
- Supabase pgvector with HNSW index

### What's being fixed
- Knowledge base upload pipeline (being stabilized)
- Confidence score accuracy
- Section regeneration reliability
- E2E test coverage (Playwright)
- Production deployment hardening

---

## Roadmap

- [x] RFP upload and requirement extraction
- [x] Knowledge base with vector search (HNSW)
- [x] AI section generation with streaming
- [x] Rich text editor (Tiptap)
- [x] PDF export
- [ ] Production deployment (Vercel)
- [ ] Stripe billing ($49/mo Solo, $149/mo Team, $299/mo Agency)
- [ ] DOCX export
- [ ] Multi-user organizations
- [ ] Custom brand voice profiles
- [ ] Proposal templates library

---

## Part of the Workflow Collection

ProposalPilot is built and maintained using automated SDLC workflows:

| Workflow | Role |
|----------|------|
| [claude-workflow-ai-saas](https://github.com/daniyalmalikoo7/claude-workflow-ai-saas) | Original build (28 agents, 5 phases) |
| [claude-workflow-rescue](https://github.com/daniyalmalikoo7/claude-workflow-rescue) | Current rescue & hardening (21 agents) |

---

## License

MIT