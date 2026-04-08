# Audit Tools Reference

Every tool listed here produces structured output that agents parse. Never guess — run it and read the output.

## Build Health
- **tsc:** `npx tsc --noEmit --pretty false 2>&1 | tee docs/audit/tsc-raw.txt` → one error per line: `file(line,col): error TSxxxx: message`
- **ESLint:** `npx eslint . --format json --output-file docs/audit/eslint-raw.json` → JSON array with errorCount, warningCount, messages[]
- **Next.js Build:** `npm run build 2>&1 | tee docs/audit/build-raw.txt` → exit code 0 = success

## Dependencies
- **npm audit:** `npm audit --json > docs/audit/npm-audit-raw.json` → vulnerabilities by severity
- **npm outdated:** `npm outdated --json > docs/audit/npm-outdated-raw.json` → current/wanted/latest per package
- **Knip:** `npx knip --reporter json > docs/audit/knip-raw.json` → unused files, deps, exports, types. Install: `npm i -D knip`

## Security
- **Semgrep:** `semgrep scan --config auto --config p/react --config p/nextjs --config p/owasp-top-ten --json -o docs/audit/semgrep-raw.json` Install: `pip install semgrep --break-system-packages`
- **Gitleaks:** `gitleaks detect -f json -r docs/audit/gitleaks-raw.json` Install: download binary from GitHub releases

## Runtime
- **Playwright:** `npx playwright install chromium` then use Playwright API for page crawling
- **Lighthouse:** `npx lighthouse URL --output=json --output-path=docs/audit/lighthouse-raw.json --chrome-flags="--headless"`
- **axe-core:** `npm i -D @axe-core/playwright` then AxeBuilder({ page }).analyze() in Playwright

## Architecture
- **dependency-cruiser:** `npx depcruise src --output-type json > docs/audit/depcruise-raw.json` Install: `npm i -D dependency-cruiser`
- **Prisma:** `npx prisma validate` and `npx prisma migrate status`

## Auto-Fix Tools (deterministic, safe)
1. `npx prettier --write .` — formatting only
2. `npx eslint --fix src/` — auto-fixable lint rules (run up to 3x for multipass)
3. `npx knip --fix` — remove unused exports and deps
4. `npm audit fix` — semver-compatible CVE patches only
5. NEVER run `npm audit fix --force` or `knip --fix --allow-remove-files` without user approval
