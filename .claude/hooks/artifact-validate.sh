#!/bin/bash
# Validates rescue artifacts have required content
# Three-tier: BLOCK (exit 2), WARN (echo + continue), PASS (silent)
# Fires after artifact creation

FILE="$1"

if [ ! -f "$FILE" ]; then
  exit 0
fi

TIER="PASS"

warn() {
  echo "WARN: $1"
  [ "$TIER" = "PASS" ] && TIER="WARN"
}

block() {
  echo "BLOCKED: $1"
  TIER="BLOCK"
}

# All audit reports must have Summary section
if echo "$FILE" | grep -q "docs/audit/"; then
  if ! grep -q "## Summary" "$FILE"; then
    warn "Audit report $FILE missing ## Summary section"
  fi
  if [ "$(wc -l < "$FILE")" -lt 10 ]; then
    warn "Audit report $FILE is suspiciously short (< 10 lines)"
  fi
fi

# Rescue decision must have explicit "Decision:" with one of three values
if echo "$FILE" | grep -q "06-rescue-decision"; then
  if ! grep -q "## Decision" "$FILE"; then
    block "Rescue decision must contain ## Decision heading"
  fi
  if ! grep -qE "Decision:?\s*(RESCUE|REWRITE|ABANDON)" "$FILE" && \
     ! grep -qE "^\*\*\s*(RESCUE|REWRITE|ABANDON)\s*\*\*" "$FILE"; then
    block "Rescue decision must state RESCUE, REWRITE, or ABANDON after Decision heading"
  fi
  if ! grep -q "## Health Score" "$FILE"; then
    warn "Rescue decision missing ## Health Score section"
  fi
fi

# Fix plan must have layers and work packages
if echo "$FILE" | grep -q "02-fix-plan"; then
  if ! grep -q "## Layer 0" "$FILE"; then
    block "Fix plan must contain at least ## Layer 0"
  fi
  if ! grep -qE "### WP|## Work Package|### Layer [0-9]" "$FILE" && ! grep -q "## Layer 1" "$FILE"; then
    warn "Fix plan should contain work packages or multiple layers"
  fi
fi

# Classified findings must have severity categories
if echo "$FILE" | grep -q "01-classified-findings"; then
  for severity in CRITICAL HIGH MEDIUM LOW; do
    if ! grep -q "$severity" "$FILE"; then
      warn "Classified findings missing severity category: $severity"
    fi
  done
fi

# Validation reports must have a clear verdict
if echo "$FILE" | grep -q "docs/reports/"; then
  if ! grep -qE "PASS|FAIL|Status:|Verdict:|Result:" "$FILE"; then
    warn "Validation report $FILE has no clear PASS/FAIL verdict"
  fi
fi

# Ship reports must exist with content
if echo "$FILE" | grep -q "docs/ship/"; then
  if [ "$(wc -l < "$FILE")" -lt 5 ]; then
    warn "Ship report $FILE is suspiciously short (< 5 lines)"
  fi
fi

# Exit based on tier
if [ "$TIER" = "BLOCK" ]; then
  exit 2
fi

exit 0
