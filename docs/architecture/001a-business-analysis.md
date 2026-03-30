# Phase 1: Business Domain Analysis

**Parent:** [001-domain-exploration.md](./001-domain-exploration.md)

---

## 1.1 Market Context

**Problem:** Professional services companies rely on proposals to win revenue. The process is manual, repetitive, and expert-dependent:

- 20-40 hours per proposal (senior staff time)
- 70-80% loss rate industry average
- $4,500-$9,000 wasted per lost proposal
- Knowledge trapped in individual heads and past documents

**Market Size:** Global professional services: $6.2T. AI sales assistant software: $3.85B (2026) → $26.09B (2035). RFP/proposal generation sub-segment growing at 57.2% CAGR. TAM for mid-market proposal tools: ~$2-4B.

**Industry Shift:** Firms moving from hourly billing to outcome-based pricing need faster proposal cycles and higher win rates.

---

## 1.2 User Personas

### Sarah — Agency BD Director

- **Company:** 120-person digital marketing agency | **Volume:** 12-15 proposals/month
- **Pain:** 60% of time on proposals, rewriting similar content, no past-proposal search, brand voice inconsistency, tight RFP deadlines (48-72 hrs)
- **Success:** Win rate 25% → 35% | **WTP:** $199-499/mo

### Marcus — IT Consulting Partner

- **Company:** 300-person IT consulting/MSP | **Volume:** 8-10 proposals/month
- **Pain:** Technical accuracy, RFP compliance gaps, knowledge silos, review bottleneck (single approver)
- **Success:** 60% reduction in creation time | **WTP:** $499-999/mo

### Priya — Solo Management Consultant

- **Company:** Independent | **Volume:** 3-5 proposals/month
- **Pain:** Proposals eat billable hours, no design skills, can't match big-firm quality
- **Success:** Professional proposals in <2 hours | **WTP:** $49/mo

### James — Government Contracts Manager

- **Company:** 80-person engineering firm | **Volume:** 15-25 RFPs/month
- **Pain:** Extreme compliance requirements, weighted scoring criteria, mandatory formats, past performance documentation
- **Success:** 100% compliance rate on mandatory requirements | **WTP:** $499-999/mo

### Elena — Proposal Operations Manager

- **Company:** 400-person MSP | **Volume:** 20+ proposals/month
- **Pain:** Outdated content library, no win/content correlation, months-long team onboarding, inconsistent quality
- **Success:** Content reuse up, onboarding time down | **WTP:** $999/mo

---

## 1.3 Value Proposition

**Primary:** "Turn a 30-hour proposal into a 3-hour review."

| Capability             | Responsive/Loopio | PandaDoc/Proposify | ProposalPilot         |
| ---------------------- | ----------------- | ------------------ | --------------------- |
| AI-native generation   | Bolted-on         | No/basic           | Core architecture     |
| Self-learning KB       | Manual curation   | Templates only     | Auto-learns from wins |
| Brand voice adaptation | None              | Templates          | AI learns your voice  |
| RFP extraction         | Manual mapping    | N/A                | Automated AI          |
| Mid-market pricing     | $20K+/yr          | $49/mo (no intel)  | $49-999/mo            |

---

## 1.4 Success Metrics

**Growth:** MRR $50K (Y1) → $300K (Y2). 200 → 1,000 customers. Churn <5% → <3%. Trial conversion >15%.

**Quality:** AI draft time <5 min. <20% edits needed on 60%+ of sections. Requirement extraction >95% accuracy. Parse success >98%. Uptime 99.9%.

**Value:** >4 proposals/user/month. >15 hrs saved/proposal. >20% relative win rate improvement. NPS >50.

---

## 1.5 Risk Assessment

| Risk                              | Likelihood | Impact   | Mitigation                                               |
| --------------------------------- | ---------- | -------- | -------------------------------------------------------- |
| Incumbents add AI + drop pricing  | Medium     | High     | Move fast, vertical depth as moat                        |
| AI commoditization (ChatGPT etc.) | Medium     | Medium   | KB + brand voice + compliance = defensible               |
| Document parsing brittleness      | High       | Critical | Multi-provider, human fallback, fewer formats done well  |
| AI hallucination in proposals     | Medium     | Critical | Source citations, confidence scoring, fact-check layer   |
| Knowledge base cold start         | High       | High     | Industry starter packs, bulk import, progressive quality |
| Context window limits             | Medium     | High     | Hierarchical summarization, smart context selection      |
| Data privacy (SOC 2/GDPR)         | High       | High     | Data isolation from day 1, SOC 2 by end of Y1            |
