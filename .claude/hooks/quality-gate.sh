#!/bin/bash
# Quality gate — runs on Stop events during Phase 2+
# Checks build health after every Claude completion

# Skip if no source files exist yet
if [ ! -d "src" ] && [ ! -d "app" ]; then
  exit 0
fi

# Skip if package.json doesn't exist
if [ ! -f "package.json" ]; then
  exit 0
fi

ERRORS=0

# TypeScript check
if command -v npx &>/dev/null && [ -f "tsconfig.json" ]; then
  TSC_OUT=$(npx tsc --noEmit --pretty false 2>&1)
  TSC_ERRORS=$(echo "$TSC_OUT" | grep -c "error TS" || true)
  if [ "$TSC_ERRORS" -gt 0 ]; then
    echo "⚠️  TypeScript: $TSC_ERRORS errors found"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Build check
if npm run build --silent 2>/dev/null; then
  : # Build passes
else
  echo "⚠️  Build failed"
  ERRORS=$((ERRORS + 1))
fi

# Report but don't block during rescue — fixes are incremental
if [ "$ERRORS" -gt 0 ]; then
  echo "Quality gate: $ERRORS issue(s) remain. Continue fixing."
fi

exit 0
