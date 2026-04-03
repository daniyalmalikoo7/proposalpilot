#!/usr/bin/env bash
# Session End Hook — auto-updates STATE.md timestamp and commits memory checkpoint

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE_FILE="$REPO_ROOT/docs/memory/STATE.md"

# Update timestamp in STATE.md
TODAY=$(date +%Y-%m-%d)
if [ -f "$STATE_FILE" ]; then
  sed -i '' "s/_Last updated: .*/_Last updated: $TODAY_/" "$STATE_FILE" 2>/dev/null || \
  sed -i "s/_Last updated: .*/_Last updated: $TODAY_/" "$STATE_FILE" 2>/dev/null || true
fi

cd "$REPO_ROOT"

# Only commit if there are changes to memory or state files
CHANGED=$(git diff --name-only docs/memory/ .claude/state/ 2>/dev/null)
UNTRACKED=$(git ls-files --others --exclude-standard docs/memory/ .claude/state/ 2>/dev/null)

if [ -n "$CHANGED" ] || [ -n "$UNTRACKED" ]; then
  git add docs/memory/ .claude/state/ 2>/dev/null
  git commit -m "docs(memory): auto-checkpoint $(date +%Y-%m-%dT%H:%M)" 2>/dev/null && \
    echo "Memory checkpoint committed." || \
    echo "Memory checkpoint: nothing new to commit."
else
  echo "Memory checkpoint: no changes to persist."
fi

exit 0
