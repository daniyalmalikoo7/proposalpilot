# Phase 2: Technical Domain Analysis

**Parent:** [001-domain-exploration.md](./001-domain-exploration.md)

---

## 2.1 Data Model — Core Entities

```
Organization (tenant)
├── Users (team members with roles)
├── Projects (proposal pipeline)
│   ├── Opportunity (the deal/RFP being responded to)
│   │   ├── source_document (uploaded RFP/brief)
│   │   ├── extracted_requirements[]
│   │   ├── evaluation_criteria[]
│   │   ├── deadlines[]
│   │   └── compliance_matrix
│   ├── Proposal (the response document)
│   │   ├── sections[] (exec summary, approach, team, pricing)
│   │   ├── version_history[]
│   │   ├── collaborators[]
│   │   ├── approval_status
│   │   └── export_formats[]
│   └── Analytics (win/loss, time, ai_stats)
├── KnowledgeBase
│   ├── PastProposals[], CaseStudies[], TeamBios[]
│   ├── CompanyCapabilities[], Certifications[]
│   ├── Methodologies[], BoilerplateContent[]
│   └── Embeddings (pgvector)
├── BrandProfile
│   ├── voice_guidelines, tone_preferences
│   ├── terminology_dictionary
│   ├── templates[], visual_assets[]
└── Settings (ai_prefs, workflows, integrations, billing)
```

**Key Relationships:** Multi-tenant (org-scoped). Project = Opportunity + Proposal (1:1:1). Proposal → ordered Sections. Section ↔ KB items (many:many via AI matching). Append-only version history.

---

## 2.2 System Boundaries

**Inputs:** RFP documents (PDF, DOCX, text, email), past proposals, team bios/case studies, CRM data, user edits/feedback.

**Outputs:** Proposal documents (PDF, DOCX), compliance matrices, analytics dashboards, content suggestions, cost reports.

**External Integrations (priority order):**

1. Document processing (PDF/DOCX parsing, OCR)
2. AI/LLM (Anthropic Claude primary, OpenAI fallback)
3. Vector DB (pgvector, colocated with Postgres)
4. CRM (Salesforce, HubSpot) — V1.1
5. Cloud storage (Drive, OneDrive) — V2
6. E-signature (DocuSign) — V2
7. Comms (Slack, Teams) — V2

---

## 2.3 Scale Requirements

| Dimension        | Year 1  | Year 2  |
| ---------------- | ------- | ------- |
| Organizations    | 200     | 1,000   |
| Users            | 1,000   | 8,000   |
| Proposals/month  | 2,000   | 15,000  |
| AI calls/day     | ~10,000 | ~80,000 |
| Doc uploads/day  | ~500    | ~3,000  |
| KB items (total) | ~100K   | ~1M     |
| Storage          | ~500 GB | ~5 TB   |

**Performance Targets:** Doc parse <30s. Requirement extraction <60s. KB search <2s. Section generation <30s (streaming). Full draft <5 min. Editor save <500ms. Export <15s.

---

## 2.4 GenAI Integration Points

| Integration                | Value    | Gimmick Risk | Notes                                            |
| -------------------------- | -------- | ------------ | ------------------------------------------------ |
| RFP requirement extraction | Critical | Low          | Structured extraction via Claude JSON mode + Zod |
| KB semantic search         | Critical | Low          | Embeddings outperform keyword dramatically       |
| Section draft generation   | Critical | Medium       | Core value. Quality must save time, not add it   |
| Brand voice adaptation     | High     | Medium       | Few-shot from past winning proposals             |
| Compliance verification    | High     | Low          | Cross-ref proposal ↔ requirements                |
| Content freshness scoring  | Medium   | Low          | Flag stale case studies, expired certs           |
| Win/loss analysis          | Medium   | Medium       | Needs data volume to be useful                   |
| Pricing suggestion         | Low      | High         | Too many variables; templates better             |

**Architecture Decisions:**

1. **Extraction:** Claude structured output + Zod. Multi-pass: extract → validate → confidence score.
2. **RAG:** pgvector embeddings. Hybrid search (semantic + keyword). ~500-token chunks, 100-token overlap. Cross-encoder reranking.
3. **Generation:** Section-by-section (not full doc). Context per section: system prompt + voice examples + KB chunks + requirements.
4. **Voice learning:** Extract style features from 5-10 past wins. Store as voice profile. Inject as few-shot examples.
5. **Hallucination prevention:** Mandatory KB source citations. Confidence scoring. Assertion extraction + verification. Never generate unlisted capabilities/certs/team.

---

## 2.5 Technical Risks

| Risk                               | Difficulty      | Mitigation                                                          |
| ---------------------------------- | --------------- | ------------------------------------------------------------------- |
| PDF/DOCX parsing fidelity          | Hardest problem | Multi-provider (pdf.js + Textract), quality scoring, human fallback |
| KB cold start                      | High            | Industry starter packs, bulk import, progressive quality messaging  |
| Context window overflow            | High            | Hierarchical summarization, per-section token budgets               |
| Real-time collaboration            | Medium          | Section-level locking first, CRDTs later if demand warrants         |
| Export fidelity (branded PDF/DOCX) | Medium          | Puppeteer for PDF, docx.js for DOCX, template system                |
