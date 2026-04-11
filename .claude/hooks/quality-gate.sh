#!/bin/bash
# .claude/hooks/quality-gate.sh
# Blocks Claude from declaring work complete if code quality checks fail.
# Fires on Stop event. Only activates during Phase 2+ (when code changes are expected).
# Exit 2 = block. Exit 0 = allow.

# Only enforce during build phase (when build artifacts indicate code changes are happening)
if [[ ! -f "docs/build/token-implementation-log.md" ]] && [[ ! -f "docs/design/07-migration-plan.md" ]]; then
  # Not in build phase yet — skip quality checks
  exit 0
fi

# Check if this is a code project (has package.json)
if [[ ! -f "package.json" ]]; then
  exit 0
fi

FAILURES=()

# TypeScript check
if command -v npx &>/dev/null && grep -q '"typescript"' package.json 2>/dev/null; then
  if ! npx tsc --noEmit 2>/dev/null; then
    FAILURES+=("TypeScript: npx tsc --noEmit failed")
  fi
fi

# Lint check
if grep -q '"lint"' package.json 2>/dev/null; then
  if ! npm run lint --silent 2>/dev/null; then
    FAILURES+=("Lint: npm run lint failed")
  fi
fi

# Build check (only if we're deep in Phase 2)
if [[ -f "docs/build/component-migration-log.md" ]]; then
  if grep -q '"build"' package.json 2>/dev/null; then
    if ! npm run build --silent 2>/dev/null; then
      FAILURES+=("Build: npm run build failed")
    fi
  fi
fi

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo "QUALITY GATE BLOCKED: Code quality checks failed."
  printf '  ❌ %s\n' "${FAILURES[@]}"
  echo ""
  echo "Fix these issues before proceeding."
  exit 2
fi

exit 0
