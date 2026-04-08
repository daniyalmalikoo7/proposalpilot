#!/usr/bin/env bash
# Quality Gate Hook — runs on Stop event
# Executes: tsc --noEmit, lint, build
# Exit 0 = all pass (or deps missing), Exit 2 = checks ran and failed

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  QUALITY GATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# If node_modules not installed, skip checks and warn
if [ ! -d "node_modules" ]; then
  echo ""
  echo "  ⚠️  node_modules not found — run 'npm install' first"
  echo "  Quality gate skipped (no deps to run checks against)"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 0
fi

PASS=0
FAIL=0
RESULTS=""

run_check() {
  local name="$1"
  local cmd="$2"

  local output
  if output=$(eval "$cmd" 2>&1); then
    RESULTS="${RESULTS}\n  ✅ ${name} — passed"
    PASS=$((PASS + 1))
  else
    RESULTS="${RESULTS}\n  ❌ ${name} — FAILED\n$(echo "$output" | tail -10 | sed 's/^/     /')"
    FAIL=$((FAIL + 1))
  fi
}

# 1. TypeScript type check
run_check "TypeScript (tsc --noEmit)" "./node_modules/.bin/tsc --noEmit 2>&1"

# 2. ESLint — only if config exists
if [ -f ".eslintrc" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.cjs" ] || [ -f "eslint.config.js" ] || [ -f "eslint.config.mjs" ]; then
  run_check "ESLint (npm run lint)" "npm run lint 2>&1"
else
  RESULTS="${RESULTS}\n  ⏭  ESLint — skipped (no .eslintrc found)"
fi

# 3. Build
run_check "Next.js Build (npm run build)" "npm run build 2>&1"

echo -e "$RESULTS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RESULT: ${PASS} passed, ${FAIL} failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "QUALITY GATE FAILED — fix the errors above before proceeding." >&2
  exit 2
fi

exit 0
