#!/bin/bash
# Session end — auto-saves progress
# Fires on session end / Stop events

# Auto-stage and show what changed
if ! git diff --quiet 2>/dev/null || ! git diff --staged --quiet 2>/dev/null; then
  CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --staged --name-only 2>/dev/null)
  CHANGED_COUNT=$(echo "$CHANGED" | sort -u | wc -l | tr -d ' ')
  echo "Session end: $CHANGED_COUNT files modified"
  echo "$CHANGED" | sort -u | head -20
fi

exit 0
