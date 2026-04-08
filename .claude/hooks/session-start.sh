#!/bin/bash
# Session start — reads state files to restore context
# Fires at session start

echo "=== Rescue Session Started ==="

# Show current phase if state exists
if [ -f ".claude/state/phase.json" ]; then
  echo "Phase state:"
  cat .claude/state/phase.json
fi

# Show rescue status
AUDIT_COUNT=$(ls docs/audit/*.md 2>/dev/null | wc -l | tr -d ' ')
TRIAGE_COUNT=$(ls docs/triage/*.md 2>/dev/null | wc -l | tr -d ' ')
FIX_COUNT=$(ls docs/fix/*.md 2>/dev/null | wc -l | tr -d ' ')
REPORT_COUNT=$(ls docs/reports/*.md 2>/dev/null | wc -l | tr -d ' ')

echo "Audit reports: $AUDIT_COUNT/6"
echo "Triage docs: $TRIAGE_COUNT/2"
echo "Fix reports: $FIX_COUNT/4"
echo "Validation reports: $REPORT_COUNT/5"

# Compute checksum for drift detection (cross-platform)
if command -v md5sum &>/dev/null; then
  MD5CMD="md5sum"
elif command -v md5 &>/dev/null; then
  MD5CMD="md5 -q"
else
  MD5CMD="cksum"
fi

if [ -f "docs/audit/06-rescue-decision.md" ]; then
  echo "Rescue decision: $(grep -m1 'RESCUE\|REWRITE\|ABANDON' docs/audit/06-rescue-decision.md 2>/dev/null || echo 'unknown')"
fi

exit 0
