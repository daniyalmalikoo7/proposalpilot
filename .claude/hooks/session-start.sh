#!/usr/bin/env bash
# Session Start Hook — prints project context at session open

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE_FILE="$REPO_ROOT/docs/memory/STATE.md"
BLOCKERS_FILE="$REPO_ROOT/docs/memory/BLOCKERS.md"
PHASE_FILE="$REPO_ROOT/.claude/state/phase.json"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SESSION START — ProposalPilot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Current phase from state machine
if [ -f "$PHASE_FILE" ]; then
  CURRENT_PHASE=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); print(d.get('currentPhase', 'unknown'))" 2>/dev/null || echo "unknown")
  PHASE_STATUS=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); p=str(d.get('currentPhase','')); print(d['phases'].get(p,{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
  echo ""
  echo "  Phase: $CURRENT_PHASE ($PHASE_STATUS)"
fi

# Current task and sprint from STATE.md
if [ -f "$STATE_FILE" ]; then
  SPRINT=$(grep -A1 "## Current Sprint" "$STATE_FILE" | tail -1 | sed 's/\*\*//g' | xargs)
  TASK=$(grep -A1 "## Current Task" "$STATE_FILE" | tail -1 | xargs)
  NEXT=$(grep -A1 "## Next Task" "$STATE_FILE" | tail -1 | xargs)
  UPDATED=$(grep "_Last updated:" "$STATE_FILE" | head -1 | sed 's/_//g' | xargs)
  echo "  Sprint: $SPRINT"
  echo "  Current: $TASK"
  echo "  Next: $NEXT"
  echo "  State: $UPDATED"
fi

# Open blockers from BLOCKERS.md
if [ -f "$BLOCKERS_FILE" ]; then
  echo ""
  echo "  OPEN BLOCKERS:"
  # Extract table rows (lines starting with | B and not header/separator)
  grep "^| B[0-9]" "$BLOCKERS_FILE" | while IFS='|' read -r _ id severity title status notes _; do
    id=$(echo "$id" | xargs)
    severity=$(echo "$severity" | xargs)
    title=$(echo "$title" | xargs)
    status=$(echo "$status" | xargs)
    if [ "$status" != "Resolved" ] && [ "$status" != "resolved" ]; then
      echo "  [$severity] $id — $title"
    fi
  done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
