#!/bin/bash
# .claude/hooks/session-start.sh
# Reads phase.json and memory at session start. Informational only.

echo "═══════════════════════════════════════════"
echo "  UI UPLIFT WORKFLOW — Session Start"
echo "═══════════════════════════════════════════"

# Read phase.json if exists
if [[ -f "phase.json" ]]; then
  CURRENT=$(python3 -c "import json; d=json.load(open('phase.json')); print(d.get('currentPhase', -1))" 2>/dev/null || echo "?")
  PROFILE=$(python3 -c "import json; d=json.load(open('phase.json')); p=d.get('projectProfile',{}); print(p.get('appType','not set') if p else 'not set')" 2>/dev/null || echo "?")
  echo "  Phase: $CURRENT"
  echo "  App type: $PROFILE"
else
  echo "  Phase: Not started (no phase.json)"
fi

# Count artifacts
for dir in audit design build validation ship; do
  COUNT=$(ls "docs/$dir/"*.md 2>/dev/null | wc -l | tr -d ' ')
  [[ "$COUNT" -gt 0 ]] && echo "  docs/$dir/: $COUNT artifacts"
done

# Memory check
if [[ -f "docs/memory/project.md" ]]; then
  LINES=$(wc -l < "docs/memory/project.md" | tr -d ' ')
  echo "  Memory: $LINES lines in project.md"
fi

# Prune session logs older than 14 days
if [[ -d "docs/memory/agents" ]]; then
  find "docs/memory/agents" -name "*.log" -mtime +14 -delete 2>/dev/null
fi

echo "═══════════════════════════════════════════"
exit 0
