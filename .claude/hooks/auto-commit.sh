#!/bin/bash
# Auto-commit on Stop — captures work automatically
# Phase-aware: reads current phase for better commit messages

if git diff --quiet 2>/dev/null && git diff --staged --quiet 2>/dev/null; then
  exit 0
fi

CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --staged --name-only 2>/dev/null)

# Determine phase from state file
PHASE=""
if [ -f ".claude/state/phase.json" ]; then
  PHASE=$(grep -o '"currentPhase": *[0-9]' .claude/state/phase.json 2>/dev/null | grep -o '[0-9]')
fi

PHASE_NAMES=("audit" "triage" "fix" "validate" "ship")
PHASE_SCOPE="${PHASE_NAMES[$PHASE]:-rescue}"

TYPE="chore"; SCOPE=""
if echo "$CHANGED" | grep -q "docs/audit/"; then TYPE="docs"; SCOPE="audit"
elif echo "$CHANGED" | grep -q "docs/triage/"; then TYPE="docs"; SCOPE="triage"
elif echo "$CHANGED" | grep -q "docs/fix/"; then TYPE="docs"; SCOPE="fix"
elif echo "$CHANGED" | grep -q "docs/reports/"; then TYPE="docs"; SCOPE="validate"
elif echo "$CHANGED" | grep -q "docs/ship/"; then TYPE="docs"; SCOPE="ship"
elif echo "$CHANGED" | grep -q "docs/memory/"; then TYPE="docs"; SCOPE="memory"
elif echo "$CHANGED" | grep -q "tests/"; then TYPE="test"
elif echo "$CHANGED" | grep -q "src/\|app/\|lib/\|packages/"; then TYPE="fix"
elif echo "$CHANGED" | grep -q ".claude/"; then TYPE="chore"; SCOPE="workflow"
fi

# Use phase scope if no specific scope detected
[ -z "$SCOPE" ] && [ -n "$PHASE_SCOPE" ] && SCOPE="$PHASE_SCOPE"

git add -A
FILES=$(git diff --staged --name-only | wc -l | tr -d ' ')
SCOPE_PART=""
[ -n "$SCOPE" ] && SCOPE_PART="($SCOPE)"
git commit -m "${TYPE}${SCOPE_PART}: rescue update — ${FILES} file(s)" 2>/dev/null

exit 0
