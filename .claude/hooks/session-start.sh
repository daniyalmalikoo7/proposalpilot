#!/bin/bash
# Session start — reads state files to restore context
# Fires at session start

echo "=== Rescue Session Started ==="

# Show current phase from state file
if [ -f ".claude/state/phase.json" ]; then
  PHASE=$(grep -o '"currentPhase": *[0-9]' .claude/state/phase.json | grep -o '[0-9]')
  PHASE_NAMES=("Audit" "Triage" "Fix" "Validate" "Ship")
  HEALTH=$(grep -o '"healthScore": *[0-9]*' .claude/state/phase.json | grep -o '[0-9]*$')
  DECISION=$(grep -o '"rescueDecision": *"[^"]*"' .claude/state/phase.json | grep -o '"[^"]*"$' | tr -d '"')
  echo "Current Phase: ${PHASE} — ${PHASE_NAMES[$PHASE]:-Unknown}"
  [ -n "$HEALTH" ] && [ "$HEALTH" != "null" ] && echo "Health Score: ${HEALTH}/100"
  [ -n "$DECISION" ] && [ "$DECISION" != "null" ] && echo "Rescue Decision: ${DECISION}"
fi

# Show rescue progress by counting artifacts
AUDIT_COUNT=$(ls docs/audit/*.md 2>/dev/null | wc -l | tr -d ' ')
TRIAGE_COUNT=$(ls docs/triage/*.md 2>/dev/null | wc -l | tr -d ' ')
FIX_COUNT=$(ls docs/fix/*.md 2>/dev/null | wc -l | tr -d ' ')
REPORT_COUNT=$(ls docs/reports/*.md 2>/dev/null | wc -l | tr -d ' ')
SHIP_COUNT=$(ls docs/ship/*.md 2>/dev/null | wc -l | tr -d ' ')

echo "Audit reports: $AUDIT_COUNT/7"
echo "Triage docs: $TRIAGE_COUNT/2"
echo "Fix reports: $FIX_COUNT/4"
echo "Validation reports: $REPORT_COUNT/5"
echo "Ship reports: $SHIP_COUNT/6"

# Show rescue decision if it exists
if [ -f "docs/audit/06-rescue-decision.md" ]; then
  echo "Rescue decision: $(grep -m1 'Decision:.*\(RESCUE\|REWRITE\|ABANDON\)' docs/audit/06-rescue-decision.md 2>/dev/null || echo 'unknown')"
fi

exit 0
