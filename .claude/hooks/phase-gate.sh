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

# Phase 0 → Phase 1: rescue decision must be RESCUE
if echo "$COMMAND" | grep -q "/triage\|triage\.md"; then
  check_file_exists "docs/audit/06-rescue-decision.md"
  check_file_contains "docs/audit/06-rescue-decision.md" "RESCUE"
fi

# Phase 1 → Phase 2: fix plan must exist
if echo "$COMMAND" | grep -q "/fix\b\|fix\.md"; then
  check_file_exists "docs/triage/02-fix-plan.md"
fi

# Phase 2 → Phase 3: build must pass
if echo "$COMMAND" | grep -q "/validate\|validate\.md"; then
  if ! npx tsc --noEmit 2>/dev/null; then
    echo "BLOCKED: Phase gate failed. TypeScript compilation has errors. Run /fix first."
    exit 2
  fi
  if ! npm run build 2>/dev/null; then
    echo "BLOCKED: Phase gate failed. Build fails. Run /fix first."
    exit 2
  fi
fi

# Phase 3 → Phase 4: all 5 validation reports must exist
if echo "$COMMAND" | grep -q "/ship\|ship\.md"; then
  for i in 01-qa-report 02-performance-report 03-security-report 04-accessibility-report 05-code-review; do
    check_file_exists "docs/reports/${i}.md"
  done
fi

exit 0
