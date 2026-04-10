#!/bin/bash
# Quality gate — runs on Stop events during Phase 2+
# Checks build health after every Claude completion
# Stack-aware: reads from stack profile if available

# Skip if no source files exist yet
if [ ! -d "src" ] && [ ! -d "app" ] && [ ! -d "lib" ] && [ ! -d "packages" ]; then
  exit 0
fi

# Determine commands from stack profile or defaults
BUILD_CMD="npm run build"
TYPE_CMD="npx tsc --noEmit --pretty false"
if [ -f "docs/audit/00-stack-profile.json" ]; then
  CUSTOM_BUILD=$(grep -o '"buildCommand": *"[^"]*"' docs/audit/00-stack-profile.json | grep -o '"[^"]*"$' | tr -d '"')
  CUSTOM_TYPE=$(grep -o '"typeCheckCommand": *"[^"]*"' docs/audit/00-stack-profile.json | grep -o '"[^"]*"$' | tr -d '"')
  [ -n "$CUSTOM_BUILD" ] && BUILD_CMD="$CUSTOM_BUILD"
  [ -n "$CUSTOM_TYPE" ] && TYPE_CMD="$CUSTOM_TYPE"
fi

ERRORS=0

# Type check
if [ -n "$TYPE_CMD" ]; then
  TSC_OUT=$(eval "$TYPE_CMD" 2>&1)
  TSC_ERRORS=$(echo "$TSC_OUT" | grep -c "error" || true)
  if [ "$TSC_ERRORS" -gt 0 ]; then
    echo "Quality gate: $TSC_ERRORS type errors found"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Build check
if eval "$BUILD_CMD" --silent 2>/dev/null; then
  : # Build passes
else
  echo "Quality gate: Build failed"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "Quality gate: $ERRORS issue(s) remain. Continue fixing."
fi

exit 0
