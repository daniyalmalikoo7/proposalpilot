#!/bin/bash
# Validates rescue artifacts have required content
# Fires after artifact creation

FILE="$1"

if [ ! -f "$FILE" ]; then
  exit 0
fi

# Check audit reports have Summary section
if echo "$FILE" | grep -q "docs/audit/"; then
  if ! grep -q "## Summary" "$FILE"; then
    echo "WARN: Audit report $FILE missing ## Summary section"
  fi
fi

# Check rescue decision has explicit decision
if echo "$FILE" | grep -q "06-rescue-decision"; then
  if ! grep -qE "^##\s*Decision|RESCUE|REWRITE|ABANDON" "$FILE"; then
    echo "BLOCKED: Rescue decision must contain ## Decision with RESCUE, REWRITE, or ABANDON"
    exit 2
  fi
fi

# Check fix plan has layers
if echo "$FILE" | grep -q "02-fix-plan"; then
  if ! grep -q "## Layer 0" "$FILE"; then
    echo "BLOCKED: Fix plan must contain at least Layer 0"
    exit 2
  fi
fi

# Check classified findings has summary table
if echo "$FILE" | grep -q "01-classified-findings"; then
  if ! grep -q "CRITICAL" "$FILE"; then
    echo "WARN: Classified findings should contain severity categories"
  fi
fi

exit 0
