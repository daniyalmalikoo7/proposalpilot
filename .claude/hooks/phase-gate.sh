#!/bin/bash
# .claude/hooks/phase-gate.sh
# Blocks phase entry if prerequisites are missing.
# Reads phase.json for state tracking, falls back to artifact existence check.
# Exit 2 = block. Exit 0 = allow.

PHASE_FILE="phase.json"
COMMAND_ARGS="${TOOL_INPUT:-}"

# Determine target phase from command context
TARGET_PHASE=""
if echo "$COMMAND_ARGS" | grep -qi "design\|phase.1"; then TARGET_PHASE=1
elif echo "$COMMAND_ARGS" | grep -qi "uplift\|phase.2"; then TARGET_PHASE=2
elif echo "$COMMAND_ARGS" | grep -qi "validate\|phase.3"; then TARGET_PHASE=3
elif echo "$COMMAND_ARGS" | grep -qi "fix"; then TARGET_PHASE=3  # fix operates within phase 3
elif echo "$COMMAND_ARGS" | grep -qi "retro"; then TARGET_PHASE=3  # retro operates within phase 3
elif echo "$COMMAND_ARGS" | grep -qi "ship\|phase.4"; then TARGET_PHASE=4
else exit 0; fi

# Check phase.json if it exists
if [[ -f "$PHASE_FILE" ]]; then
  CURRENT=$(python3 -c "import json; print(json.load(open('$PHASE_FILE'))['currentPhase'])" 2>/dev/null || echo "-1")
  REQUIRED=$((TARGET_PHASE - 1))
  if [[ "$CURRENT" -lt "$REQUIRED" ]]; then
    echo "PHASE GATE: Current phase is $CURRENT, but phase $TARGET_PHASE requires phase $REQUIRED complete."
    exit 2
  fi
fi

# Artifact existence checks (fallback and double-check)
check_artifacts() {
  local missing=()
  for f in "$@"; do
    [[ ! -f "$f" ]] && missing+=("$f")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "PHASE GATE BLOCKED: Missing artifacts:"
    printf '  - %s\n' "${missing[@]}"
    exit 2
  fi
}

case $TARGET_PHASE in
  1) check_artifacts "docs/audit/01-route-manifest.md" "docs/audit/02-visual-quality-report.md" "docs/audit/03-interaction-report.md" ;;
  2) check_artifacts "docs/design/04-design-tokens.md" "docs/design/05-component-strategy.md" "docs/design/06-motion-spec.md" "docs/design/07-migration-plan.md" ;;
  3) check_artifacts "docs/build/token-implementation-log.md" "docs/build/component-migration-log.md" ;;
  4) check_artifacts "docs/validation/08-visual-regression-report.md" "docs/validation/09-quality-scorecard.md" "docs/validation/10-interaction-validation.md"
     # Retro required for ship
     if echo "$COMMAND_ARGS" | grep -qi "ship"; then
       check_artifacts "docs/validation/11-retro-report.md"
     fi ;;
esac

echo "Phase gate passed."
exit 0
