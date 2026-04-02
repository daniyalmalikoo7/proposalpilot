# ProposalPilot

**AI proposals grounded in your company's knowledge.**

ProposalPilot is an AI-powered proposal and statement-of-work engine for professional services companies. Upload an RFP, let the AI extract every requirement, match your past wins from a knowledge base, and generate a tailored, brand-consistent proposal in minutes — not days.

---

## Features

- **RFP Analysis** — Paste or upload a DOCX/PDF RFP; the AI extracts structured requirements automatically
- **Requirement Extraction** — Every must-have and should-have is surfaced, scored, and tracked
- **KB-Grounded Generation** — Responses are anchored in your real past work, not hallucinated content
- **Confidence Scoring** — Each section shows how well the AI-generated content covers the requirements
- **One-click Regeneration** — Regenerate any section with updated context or requirements
- **PDF Export** — Print-ready export from the browser; DOCX export on the roadmap

---

## How It Works

1. **Upload your RFP** — Drop in a DOCX file; mammoth extracts the full text server-side
2. **Extract requirements** — Gemini 2.5 Flash identifies and structures every requirement
3. **Match your knowledge base** — pgvector retrieves the most relevant past proposals and case studies
4. **Generate the proposal** — Sections stream directly into the Tiptap editor, grounded in your KB

---

## Tech Stack

Next.js 15 · tRPC v11 · PostgreSQL + pgvector (Supabase) · Gemini 2.5 Flash · Clerk · Tailwind + shadcn/ui

---

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-org/proposalpilot.git
cd proposalpilot
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in: DATABASE_URL, CLERK_*, GOOGLE_GENERATIVE_AI_API_KEY, VOYAGE_API_KEY

# 3. Set up the database
npx prisma migrate dev

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

### Required environment variables

| Variable                            | Description                           |
| ----------------------------------- | ------------------------------------- |
| `DATABASE_URL`                      | Supabase PostgreSQL connection string |
| `CLERK_SECRET_KEY`                  | Clerk backend secret                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key                    |
| `GOOGLE_GENERATIVE_AI_API_KEY`      | Gemini API key                        |
| `VOYAGE_API_KEY`                    | Voyage AI embeddings key              |

---

## Roadmap

- [x] RFP upload and requirement extraction
- [x] Knowledge base with vector search
- [x] AI section generation with confidence scores
- [x] PDF export
- [ ] DOCX export
- [ ] Stripe billing (Free / Pro)
- [ ] Multi-user organizations
- [ ] Custom brand voice profiles
- [ ] Proposal templates library

---

## License

MIT
