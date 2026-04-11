#!/bin/bash
set -euo pipefail
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$BACKUP_DIR")")"

echo "Removing ui-uplift workflow files..."
rm -rf "$PROJECT_DIR/.claude/agents" "$PROJECT_DIR/.claude/commands" "$PROJECT_DIR/.claude/hooks" "$PROJECT_DIR/.claude/skills"
rm -f "$PROJECT_DIR/CLAUDE.md" "$PROJECT_DIR/settings.json" "$PROJECT_DIR/phase.json"
rm -rf "$PROJECT_DIR/scripts"

echo "Restoring backups..."
[[ -d "$BACKUP_DIR/.claude-backup" ]] && cp -r "$BACKUP_DIR/.claude-backup/"* "$PROJECT_DIR/.claude/" 2>/dev/null || true
[[ -f "$BACKUP_DIR/CLAUDE.md.backup" ]] && cp "$BACKUP_DIR/CLAUDE.md.backup" "$PROJECT_DIR/CLAUDE.md"
[[ -f "$BACKUP_DIR/settings.json.backup" ]] && cp "$BACKUP_DIR/settings.json.backup" "$PROJECT_DIR/settings.json"

echo "Uninstall complete. Backup preserved in $BACKUP_DIR/"
