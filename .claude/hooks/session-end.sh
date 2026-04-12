#!/bin/bash
# .claude/hooks/session-end.sh
# Auto-reports session summary on Stop event.
# Exit 0 always — informational, never blocks.

# Generate a brief session summary
MODIFIED=$(git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')
STAGED=$(git diff --staged --name-only 2>/dev/null | wc -l | tr -d ' ')
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')

TOTAL=$((MODIFIED + STAGED + UNTRACKED))

if [[ "$TOTAL" -gt 0 ]]; then
  echo "═══════════════════════════════════════════"
  echo "  SESSION END — $TOTAL file(s) changed"
  echo "  Modified: $MODIFIED  Staged: $STAGED  New: $UNTRACKED"
  echo "  Consider: git add -A && git commit -m 'feat(uplift): [description]'"
  echo "═══════════════════════════════════════════"
fi

exit 0
