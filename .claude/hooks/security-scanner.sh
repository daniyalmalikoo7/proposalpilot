#!/bin/bash
# Security scanner — blocks dangerous patterns in rescue commits
# Fires on PreToolUse for file writes

CONTENT="$*"

# Block hardcoded secrets
if echo "$CONTENT" | grep -qE "(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|password\s*=\s*['\"][^'\"]{8,})"; then
  echo "BLOCKED: Potential secret/API key detected in content. Never hardcode secrets."
  exit 2
fi

# Block dangerous commands
if echo "$CONTENT" | grep -qE "rm\s+-rf\s+/|sudo\s+rm|DROP\s+TABLE|TRUNCATE\s+TABLE"; then
  echo "BLOCKED: Dangerous command detected. Review manually."
  exit 2
fi

# Block .env file commits
if echo "$CONTENT" | grep -qE "git\s+add.*\.env[^.]"; then
  echo "BLOCKED: Never commit .env files. Add to .gitignore."
  exit 2
fi

exit 0
