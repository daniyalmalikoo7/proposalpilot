#!/bin/bash
# Phase gate enforcement — blocks commands if prerequisite phase incomplete
# Fires on PreToolUse for Bash commands that run phase commands

COMMAND="$1"

check_file_exists() {
  if [ ! -f "$1" ]; then
    echo "BLOCKED: Phase gate failed. Required file missing: $1"
    echo "Complete the current phase before proceeding."
    exit 2
  fi
}

check_file_contains() {
  if ! grep -q "$2" "$1" 2>/dev/null; then
    echo "BLOCKED: Phase gate failed. $1 does not contain required content: $2"
    exit 2
  fi
}

# Phase 0 → Phase 1: rescue decision must contain "Decision: RESCUE"
if echo "$COMMAND" | grep -q "/triage\|triage\.md"; then
  check_file_exists "docs/audit/06-rescue-decision.md"
  check_file_contains "docs/audit/06-rescue-decision.md" "Decision"
  if ! grep -qE "RESCUE|Decision:.*RESCUE" "docs/audit/06-rescue-decision.md" 2>/dev/null; then
    echo "BLOCKED: Rescue decision does not contain RESCUE. Cannot proceed to triage."
    exit 2
  fi
fi

# Phase 1 → Phase 2: fix plan must exist with at least one work package
if echo "$COMMAND" | grep -q "/fix\|fix\.md"; then
  check_file_exists "docs/triage/02-fix-plan.md"
  if ! grep -q "## Layer 0\|## Work Package\|### WP" "docs/triage/02-fix-plan.md" 2>/dev/null; then
    echo "BLOCKED: Fix plan exists but contains no work packages. Complete triage first."
    exit 2
  fi
fi

# Phase 2 → Phase 3: build must pass (uses stack profile if available)
if echo "$COMMAND" | grep -q "/validate\|validate\.md"; then
  BUILD_CMD="npm run build"
  TYPE_CMD="npx tsc --noEmit"
  if [ -f "docs/audit/00-stack-profile.json" ]; then
    CUSTOM_BUILD=$(grep -o '"buildCommand": *"[^"]*"' docs/audit/00-stack-profile.json | grep -o '"[^"]*"$' | tr -d '"')
    CUSTOM_TYPE=$(grep -o '"typeCheckCommand": *"[^"]*"' docs/audit/00-stack-profile.json | grep -o '"[^"]*"$' | tr -d '"')
    [ -n "$CUSTOM_BUILD" ] && BUILD_CMD="$CUSTOM_BUILD"
    [ -n "$CUSTOM_TYPE" ] && TYPE_CMD="$CUSTOM_TYPE"
  fi
  if ! eval "$TYPE_CMD" 2>/dev/null; then
    echo "BLOCKED: Phase gate failed. Type checking has errors. Run /fix first."
    exit 2
  fi
  if ! eval "$BUILD_CMD" 2>/dev/null; then
    echo "BLOCKED: Phase gate failed. Build fails. Run /fix first."
    exit 2
  fi
fi

# Phase 3 → Phase 4: all 5 validation reports must exist AND zero critical findings
if echo "$COMMAND" | grep -q "/ship\|ship\.md"; then
  for i in 01-qa-report 02-performance-report 03-security-report 04-accessibility-report 05-code-review; do
    check_file_exists "docs/reports/${i}.md"
  done
  CRITICAL_COUNT=0
  for report in docs/reports/*.md; do
    COUNT=$(grep -ci "CRITICAL" "$report" 2>/dev/null || echo "0")
    CRITICAL_COUNT=$((CRITICAL_COUNT + COUNT))
  done
  if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo "WARN: $CRITICAL_COUNT references to CRITICAL found in validation reports. Review before shipping."
  fi
fi

exit 0
