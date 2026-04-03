#!/usr/bin/env bash
# Phase Gate Hook — enforces phase prerequisites before /design, /build, /validate, /ship
# Reads tool input from stdin as JSON: { "tool_name": "...", "tool_input": { "command": "..." } }
# Exit 0 = allow, Exit 2 = block

PHASE_FILE="$(dirname "$0")/../state/phase.json"

if [ ! -f "$PHASE_FILE" ]; then
  exit 0
fi

# Read the command being executed from stdin
INPUT=$(cat /dev/stdin 2>/dev/null || echo "{}")
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

# Only gate specific slash-command triggers
case "$COMMAND" in
  *"/design"*)
    GATE="design"
    ;;
  *"/build"*)
    GATE="build"
    ;;
  *"/validate"*)
    GATE="validate"
    ;;
  *"/ship"*)
    GATE="ship"
    ;;
  *)
    exit 0
    ;;
esac

# Parse phase state
PHASE_0=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); print(d['phases']['0']['status'])" 2>/dev/null || echo "unknown")
PHASE_1=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); print(d['phases']['1']['status'])" 2>/dev/null || echo "unknown")
PHASE_2=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); print(d['phases']['2']['status'])" 2>/dev/null || echo "unknown")
PHASE_3=$(python3 -c "import json; d=json.load(open('$PHASE_FILE')); print(d['phases']['3']['status'])" 2>/dev/null || echo "unknown")

fail() {
  echo "PHASE GATE BLOCKED: $1" >&2
  echo "Current phase state: Phase 0=$PHASE_0 | Phase 1=$PHASE_1 | Phase 2=$PHASE_2 | Phase 3=$PHASE_3" >&2
  echo "Update .claude/state/phase.json to proceed." >&2
  exit 2
}

case "$GATE" in
  design)
    if [ "$PHASE_0" != "complete" ]; then
      fail "/design requires Phase 0 (Discovery) to be complete. Got: $PHASE_0"
    fi
    ;;
  build)
    if [ "$PHASE_1" != "complete" ] && [ "$PHASE_1" != "skipped" ]; then
      fail "/build requires Phase 1 (Design) to be complete or skipped. Got: $PHASE_1"
    fi
    ;;
  validate)
    if [ "$PHASE_2" != "complete" ]; then
      fail "/validate requires Phase 2 (Build) to be complete. Got: $PHASE_2. Run: npx tsc --noEmit && npm run lint && npm run build"
    fi
    ;;
  ship)
    if [ "$PHASE_3" != "complete" ]; then
      fail "/ship requires Phase 3 (Validate) to be complete. Got: $PHASE_3. All 5 validation reports must exist in docs/reports/."
    fi
    # Also verify all validation reports exist
    REPORTS_DIR="$(dirname "$0")/../../docs/reports"
    MISSING=""
    for report in qa-report.md performance-report.md security-report.md accessibility-report.md code-review-report.md; do
      if [ ! -f "$REPORTS_DIR/$report" ]; then
        MISSING="$MISSING $report"
      fi
    done
    if [ -n "$MISSING" ]; then
      fail "/ship blocked — missing validation reports:$MISSING. Run /validate first."
    fi
    ;;
esac

exit 0
