#!/bin/bash
# .claude/hooks/auto-commit.sh
# Auto-commits work on every Stop event. Fires after quality-gate and artifact-validate.
# Uses conventional commit format based on changed file paths.
# Exit 0 always — commit failure should not block Claude.

# Skip if nothing to commit
if git diff --quiet HEAD 2>/dev/null && git diff --staged --quiet 2>/dev/null && [[ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]]; then
  exit 0
fi

# Determine commit type and scope from changed files
CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --staged --name-only 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)

TYPE="chore"
SCOPE=""

if echo "$CHANGED" | grep -q "agents/"; then
  TYPE="feat"; SCOPE="agents"
elif echo "$CHANGED" | grep -q "commands/"; then
  TYPE="feat"; SCOPE="commands"
elif echo "$CHANGED" | grep -q "hooks/"; then
  TYPE="feat"; SCOPE="hooks"
elif echo "$CHANGED" | grep -q "skills/"; then
  TYPE="feat"; SCOPE="skills"
elif echo "$CHANGED" | grep -q "docs/audit/"; then
  TYPE="docs"; SCOPE="audit"
elif echo "$CHANGED" | grep -q "docs/design/"; then
  TYPE="docs"; SCOPE="design"
elif echo "$CHANGED" | grep -q "docs/build/"; then
  TYPE="feat"; SCOPE="uplift"
elif echo "$CHANGED" | grep -q "docs/validation/"; then
  TYPE="docs"; SCOPE="validation"
elif echo "$CHANGED" | grep -q "docs/ship\|docs/design-system"; then
  TYPE="docs"; SCOPE="ship"
elif echo "$CHANGED" | grep -q "src/\|components/\|app/\|lib/"; then
  TYPE="feat"; SCOPE="uplift"
elif echo "$CHANGED" | grep -q "README\|CHANGELOG\|\.md$"; then
  TYPE="docs"
fi

git add -A 2>/dev/null

FILES=$(git diff --staged --name-only 2>/dev/null | wc -l | tr -d ' ')
SCOPE_PART=""
[[ -n "$SCOPE" ]] && SCOPE_PART="($SCOPE)"

# Use cross-platform date
TIMESTAMP=$(date '+%H:%M' 2>/dev/null || echo "auto")

git commit -m "${TYPE}${SCOPE_PART}: update ${FILES} file(s) — ${TIMESTAMP}" 2>/dev/null

exit 0
