# Phase 3: Competitive & UX Intelligence

**Parent:** [001-domain-exploration.md](./001-domain-exploration.md)

---

## 3.1 Competitive Landscape

| Competitor             | Strength                                            | Weakness                                         | Price           |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------ | --------------- |
| **Responsive (RFPIO)** | Deep content library, enterprise integrations       | Poor search, unreliable AI, legacy UX            | $20K+/yr        |
| **Loopio**             | Portal-based responses, good analytics              | Weak AI accuracy, expensive, library maintenance | $20K+/yr        |
| **PandaDoc**           | Doc tracking, e-sign + payments, accessible pricing | No RFP intelligence, basic AI                    | $19-49/user/mo  |
| **Proposify**          | Clean templates, good tracking                      | Dated page format, no AI, clunky workflows       | $19-65/user/mo  |
| **AutoRFP.ai**         | AI-first, multi-format, 30+ languages               | Limited track record, high pricing               | $1K-1.45K/mo    |
| **Inventive.ai**       | Multi-agent AI, quality benchmarking                | New, unproven at scale                           | Custom          |
| **DeepRFP**            | Good for individuals, red flag detection            | Needs rewriting, basic UI                        | $75-125/user/mo |

### Common Complaints Across Market (G2/Capterra)

| Pain Point                                                  | Frequency   |
| ----------------------------------------------------------- | ----------- |
| Poor AI accuracy (irrelevant answers, needs manual rewrite) | Very High   |
| Document import/export failures (format corruption)         | Very High   |
| Expensive per-seat pricing                                  | High        |
| Content library maintenance burden                          | High        |
| Clunky/outdated UI                                          | High        |
| Formatting breaks in output                                 | High        |
| Weak search (irrelevant results)                            | Medium-High |
| No post-send editing                                        | Medium      |

---

## 3.2 Table Stakes (Must-Have from Day 1)

1. Rich-text editor with formatting, images, tables
2. Template library with variable substitution
3. Document upload (PDF, DOCX minimum)
4. Export to branded PDF/DOCX
5. Team collaboration (shared access, comments)
6. Version history with restore
7. Role-based permissions (viewer, editor, admin)
8. Search across proposals and content
9. Dashboard with proposal pipeline view
10. Basic analytics (proposals sent, status)

---

## 3.3 Differentiation Opportunities

1. **"Near-final" AI drafts** — Competitors require 50-80% rewriting. <20% editing on 60%+ of sections is category-defining.

2. **Self-maintaining knowledge base** — Auto-ingest completed proposals, auto-tag, surface stale content, learn from win/loss. Eliminates the #1 operational burden.

3. **Compliance guarantee** — Visual compliance matrix mapping every RFP requirement to proposal content with gap detection. No competitor does this reliably.

4. **Instant onboarding** — Upload 5-10 past wins → AI extracts voice, capabilities, bios, case studies → ready in <30 minutes. Competitors take weeks.

5. **Professional services-specific** — Purpose-built sections (methodology, team qualifications, case studies, SOW/pricing tables) vs. generic sales proposals.

6. **Win-rate intelligence** — Over time, identify which content and approaches correlate with wins. Surface insights during generation.

---

## 3.4 Anti-Patterns to Avoid

1. **Don't ship unreliable document parsing.** Fewer formats done perfectly > many done poorly.
2. **Don't gate everything behind per-seat pricing.** Creator seats paid; reviewers/viewers free.
3. **Don't require manual content library curation.** Auto-learn or mid-market won't adopt.
4. **Don't generate unverifiable claims.** One hallucinated cert destroys trust permanently.
5. **Don't use page-based proposal format.** Web-native editing; PDF for delivery only.
6. **Don't make AI optional/add-on.** Every interaction should feel intelligent.
