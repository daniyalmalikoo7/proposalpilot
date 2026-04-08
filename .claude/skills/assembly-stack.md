# Assembly Stack — Rescue Edition

Before building anything custom, check this list. The rescue workflow uses existing tools — never build a custom scanner when a CLI tool exists.

## Audit Tools (Phase 0)
| Category | Tool | Why This One |
|----------|------|-------------|
| Type checking | TypeScript (tsc) | Built-in, structured error output |
| Linting | ESLint | JSON output, auto-fix, 2000+ rules |
| Dead code | Knip v6+ | Supersedes depcheck, ts-prune, unimported. 100+ framework plugins including Next.js |
| SAST | Semgrep | Cross-file analysis, OWASP rules, JS/TS/React/Next.js support, JSON+SARIF output |
| Secrets | Gitleaks | Git history scanning, pattern matching, JSON output |
| Dependencies | npm audit + npm outdated | Built-in, JSON output |
| Architecture | dependency-cruiser | Circular deps, orphans, JSON output |
| Runtime | Playwright | Browser automation, screenshot, console capture |
| Accessibility | axe-core via Playwright | WCAG 2.1 AA validation, JSON results |
| Performance | Lighthouse CI | Core Web Vitals, JSON output |
| DB validation | Prisma CLI | Schema validation, migration status, drift detection |

## The Assembly Test
1. Does a CLI tool exist for this check? → Use it (see table above)
2. Does the tool produce JSON/structured output? → Parse it, don't screenshot it
3. Can the issue be auto-fixed? → Run the tool with --fix flag first
4. Only then → Use LLM judgment to fix what tools can't

## Technology Defaults (inherited from project)
The rescue workflow inherits the project's existing stack. It does NOT change:
- Framework (Next.js, React, Vue, etc.)
- Database (Prisma, Drizzle, etc.)
- Auth (Clerk, Auth.js, etc.)
- Hosting (Vercel, AWS, etc.)
The rescue workflow FIXES the existing stack. It does not migrate to a different one.
