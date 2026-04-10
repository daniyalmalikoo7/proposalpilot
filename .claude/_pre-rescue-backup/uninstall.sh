#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "Uninstalling rescue workflow from: $PROJECT_DIR"

RESCUE_DIRS=(
  ".claude/agents" ".claude/commands" ".claude/hooks"
  ".claude/skills" ".claude/schemas" ".claude/state" ".claude/memory"
)
for dir in "${RESCUE_DIRS[@]}"; do
  [[ -d "$PROJECT_DIR/$dir" ]] && rm -rf "$PROJECT_DIR/$dir" && echo "  Removed: $dir"
done

[[ -f "$PROJECT_DIR/.cursor/rules/rescue.mdc" ]] && rm "$PROJECT_DIR/.cursor/rules/rescue.mdc" && echo "  Removed: .cursor/rules/rescue.mdc"

if [[ -f "$SCRIPT_DIR/CLAUDE.md" ]]; then
  cp "$SCRIPT_DIR/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"
  echo "  Restored: CLAUDE.md"
else
  rm -f "$PROJECT_DIR/CLAUDE.md"
  echo "  Removed: CLAUDE.md (no original to restore)"
fi

if [[ -f "$SCRIPT_DIR/settings.json" ]]; then
  cp "$SCRIPT_DIR/settings.json" "$PROJECT_DIR/settings.json"
  echo "  Restored: settings.json"
fi

if [[ -f "$SCRIPT_DIR/.claudeignore" ]]; then
  cp "$SCRIPT_DIR/.claudeignore" "$PROJECT_DIR/.claudeignore"
  echo "  Restored: .claudeignore"
fi

for item in "$SCRIPT_DIR"/.claude/*; do
  [[ -e "$item" ]] || continue
  dest="$PROJECT_DIR/.claude/$(basename "$item")"
  cp -a "$item" "$dest"
  echo "  Restored: .claude/$(basename "$item")"
done

echo ""
echo "Rescue workflow uninstalled. docs/ directory preserved (contains rescue artifacts)."
echo "You can safely delete $SCRIPT_DIR now."
