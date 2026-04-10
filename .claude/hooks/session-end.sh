#!/bin/bash
# Session end — auto-saves progress and logs session for memory system
# Fires on session end / Stop events

# Show what changed this session
if ! git diff --quiet 2>/dev/null || ! git diff --staged --quiet 2>/dev/null; then
  CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --staged --name-only 2>/dev/null)
  CHANGED_COUNT=$(echo "$CHANGED" | sort -u | wc -l | tr -d ' ')
  echo "Session end: $CHANGED_COUNT files modified"
  echo "$CHANGED" | sort -u | head -20
fi

# Write session log for memory system
SESSION_DIR="docs/memory/sessions"
if [ -d "docs/" ]; then
  mkdir -p "$SESSION_DIR"
  DATE=$(date +%Y-%m-%d)
  SESSION_FILE="$SESSION_DIR/${DATE}.md"

  # Get current phase
  PHASE="unknown"
  if [ -f ".claude/state/phase.json" ]; then
    PHASE=$(grep -o '"currentPhase": *[0-9]' .claude/state/phase.json 2>/dev/null | grep -o '[0-9]' || echo "unknown")
  fi

  # Append session entry
  {
    echo ""
    echo "## Session $(date +%H:%M)"
    echo "- Phase: $PHASE"
    echo "- Files changed: $(git diff --name-only HEAD 2>/dev/null | sort -u | wc -l | tr -d ' ')"
    git diff --name-only HEAD 2>/dev/null | sort -u | head -10 | while read -r f; do echo "  - $f"; done
  } >> "$SESSION_FILE" 2>/dev/null
fi

exit 0
