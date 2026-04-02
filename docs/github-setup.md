# GitHub Repository Setup

Steps to configure the ProposalPilot repository for discoverability and a professional first impression.

---

## 1. Repository Description

Set the one-line description in **Settings → General → Description**:

```
AI-powered proposal engine for professional services — RFP analysis, KB-grounded generation, confidence scoring
```

---

## 2. Topics / Tags

In **Settings → General → Topics**, add:

```
ai proposal-generation rfp nextjs trpc postgresql pgvector tailwindcss typescript saas professional-services
```

---

## 3. Social Preview Image

GitHub shows a 1280×640 px image when the repo is shared on social media.

**Settings → General → Social preview → Upload an image**

Recommended content:

- Dark background matching the landing page (`#0a0f1e`)
- ProposalPilot wordmark (white)
- Tagline: "AI proposals grounded in your company's knowledge"
- Optional: a cropped screenshot of the proposal editor

Tools to generate quickly: [Vercel OG Image Playground](https://og-playground.vercel.app) or Figma.

---

## 4. Repository Website

Set the website to your Vercel deployment URL once live:

**Settings → General → Website** → `https://proposalpilot.app` (or your actual domain)

Also enable **"Use your GitHub Pages website"** if applicable.

---

## 5. Features to Enable

In **Settings → General → Features**:

- [x] Issues — for bug reports and feature requests
- [x] Discussions — for community Q&A (optional, enable when public)
- [ ] Wiki — not needed; docs live in `/docs`
- [x] Projects — for sprint tracking

---

## 6. Branch Protection (master)

**Settings → Branches → Add rule** for `master`:

- [x] Require a pull request before merging
- [x] Require status checks to pass (CI must be green)
- [x] Do not allow bypassing the above settings

---

## 7. Secrets

Add these in **Settings → Secrets and variables → Actions** for CI:

| Secret                              | Used by              |
| ----------------------------------- | -------------------- |
| `DATABASE_URL`                      | Prisma migrate in CI |
| `CLERK_SECRET_KEY`                  | E2E tests            |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Next.js build        |
| `GOOGLE_GENERATIVE_AI_API_KEY`      | AI integration tests |
| `VOYAGE_API_KEY`                    | Embedding tests      |
