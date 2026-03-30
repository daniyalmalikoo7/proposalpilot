# Recommendation Matrix & MVP Scope

**Parent:** [001-domain-exploration.md](./001-domain-exploration.md)

---

## Must-Have (MVP)

| #   | Feature                               | Impact | Complexity | AI Leverage | Notes                                          |
| --- | ------------------------------------- | ------ | ---------- | ----------- | ---------------------------------------------- |
| 1   | RFP/brief upload & parsing            | 5      | 4          | 3           | PDF + DOCX. Hardest technical challenge.       |
| 2   | AI requirement extraction             | 5      | 3          | 5           | Core differentiator. Claude structured output. |
| 3   | Knowledge base (manual + auto-ingest) | 5      | 3          | 4           | Past proposals, case studies, team bios.       |
| 4   | AI section-by-section generation      | 5      | 4          | 5           | RAG-powered drafts with KB matching.           |
| 5   | Rich-text collaborative editor        | 5      | 4          | 1           | Table stakes. Tiptap or ProseMirror.           |
| 6   | Compliance matrix                     | 4      | 3          | 4           | Map requirements → sections. Gap detection.    |
| 7   | Export to PDF/DOCX                    | 5      | 3          | 1           | Branded templates. Must be pixel-perfect.      |
| 8   | Auth & org multi-tenancy              | 5      | 3          | 0           | NextAuth + row-level security.                 |
| 9   | Proposal dashboard & pipeline         | 4      | 2          | 0           | Status tracking, deadlines, assignments.       |
| 10  | Brand voice profile setup             | 4      | 3          | 5           | Extract voice from past proposals.             |

## Should-Have (V1.1–V1.3)

| #   | Feature                       | Impact | Complexity | AI Leverage | Notes                                |
| --- | ----------------------------- | ------ | ---------- | ----------- | ------------------------------------ |
| 11  | Semantic search across KB     | 4      | 3          | 5           | pgvector + hybrid search.            |
| 12  | Version history & diff view   | 4      | 3          | 1           | Track changes between drafts.        |
| 13  | Team collaboration (comments) | 4      | 3          | 1           | Section-level assignment/commenting. |
| 14  | Approval workflows            | 3      | 2          | 0           | Configurable chains + notifications. |
| 15  | AI content freshness scoring  | 3      | 2          | 4           | Flag outdated case studies, certs.   |
| 16  | Bulk import wizard            | 4      | 3          | 3           | Onboard by uploading past proposals. |
| 17  | Proposal templates            | 4      | 2          | 2           | Industry-specific starters.          |
| 18  | CRM integration (SF/HubSpot)  | 3      | 3          | 1           | Auto-populate opportunity data.      |
| 19  | Email RFP ingestion           | 3      | 3          | 3           | Forward email → auto-create project. |
| 20  | Win/loss outcome tracking     | 3      | 2          | 3           | Feed outcomes back into KB learning. |

## Nice-to-Have (V2+)

| #   | Feature                          | Impact | Complexity | AI Leverage | Notes                             |
| --- | -------------------------------- | ------ | ---------- | ----------- | --------------------------------- |
| 21  | Real-time co-editing (CRDT)      | 3      | 5          | 0           | Section locking first.            |
| 22  | E-signature integration          | 3      | 2          | 0           | DocuSign/HelloSign post-proposal. |
| 23  | Win-rate predictive analytics    | 3      | 4          | 5           | Needs significant data volume.    |
| 24  | Competitor intelligence per deal | 2      | 3          | 4           | High hallucination risk.          |
| 25  | Multi-language proposals         | 2      | 3          | 4           | AI translation.                   |
| 26  | Cloud storage sync               | 2      | 3          | 0           | Drive/OneDrive import.            |
| 27  | Slack/Teams notifications        | 2      | 2          | 0           | Approvals and deadlines.          |
| 28  | Custom AI fine-tuning            | 2      | 5          | 5           | Enterprise-only.                  |
| 29  | Engagement analytics             | 3      | 3          | 1           | Requires custom proposal viewer.  |
| 30  | SOC 2 / FedRAMP                  | 3      | 4          | 0           | Required for enterprise/gov.      |

---

## Recommended MVP Scope

**Target:** 10-week build to closed beta with 20 design partners.

**Core workflow (INGEST → EXTRACT → MATCH → GENERATE → REFINE → EXPORT):**

1. **INGEST:** Upload DOCX/PDF or paste text. AI parses and structures.
2. **EXTRACT:** AI extracts requirements, criteria, deadlines → compliance matrix.
3. **MATCH:** Semantic search over KB for relevant past content per requirement.
4. **GENERATE:** Section-by-section AI draft with matched content + brand voice.
5. **REFINE:** Rich-text editor with per-section AI regeneration and inline editing.
6. **EXPORT:** One-click branded PDF/DOCX with compliance matrix appendix.

**Plus:** Auth, multi-tenancy, KB management, brand voice setup, proposal dashboard.

**Deferred:** Real-time co-editing, CRM integrations, e-signatures, predictive analytics, multi-language.

---

## Pricing Model Recommendation

| Tier       | Price   | Creator Seats | Proposals/mo | KB Items  | AI Generations  |
| ---------- | ------- | ------------- | ------------ | --------- | --------------- |
| Starter    | $49/mo  | 1             | 5            | 500       | 50 sections/mo  |
| Growth     | $199/mo | 5             | 20           | 5,000     | 300 sections/mo |
| Scale      | $499/mo | 15            | Unlimited    | 25,000    | Unlimited       |
| Enterprise | $999/mo | Unlimited     | Unlimited    | Unlimited | Unlimited + SLA |

**Key:** Reviewers/viewers always free. Overage charged per-section ($0.50/section). Annual discount 20%.
