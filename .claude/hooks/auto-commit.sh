#!/bin/bash
# Auto-commit on Stop — captures work automatically

if git diff --quiet 2>/dev/null && git diff --staged --quiet 2>/dev/null; then
  exit 0  # Nothing to commit
fi

CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --staged --name-only 2>/dev/null)

TYPE="chore"; SCOPE=""
if echo "$CHANGED" | grep -q "docs/audit/"; then TYPE="docs"; SCOPE="audit"
elif echo "$CHANGED" | grep -q "docs/triage/"; then TYPE="docs"; SCOPE="triage"
elif echo "$CHANGED" | grep -q "docs/fix/"; then TYPE="docs"; SCOPE="fix"
elif echo "$CHANGED" | grep -q "docs/reports/"; then TYPE="docs"; SCOPE="validate"
elif echo "$CHANGED" | grep -q "docs/ship/"; then TYPE="docs"; SCOPE="ship"
elif echo "$CHANGED" | grep -q "tests/"; then TYPE="test"
elif echo "$CHANGED" | grep -q "src/\|app/"; then TYPE="fix"
fi

git add -A
FILES=$(git diff --staged --name-only | wc -l | tr -d ' ')
SCOPE_PART=""
[ -n "$SCOPE" ] && SCOPE_PART="($SCOPE)"
git commit -m "${TYPE}${SCOPE_PART}: rescue update — ${FILES} file(s)" 2>/dev/null

exit 0
