#!/bin/bash
# .claude/hooks/security-scanner.sh
# Blocks dangerous commands and scans for secrets in staged files.
# Fires on PreToolUse for Bash commands.
# Exit 2 = block. Exit 0 = allow.

COMMAND="${TOOL_INPUT:-$1}"

# Block dangerous commands
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "sudo "
  "chmod 777"
  "> /dev/sda"
  "mkfs\."
  "dd if="
  ":(){:|:&};:"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qF "$pattern"; then
    echo "SECURITY: Blocked dangerous command pattern: $pattern"
    exit 2
  fi
done

# Block secret exposure in git commits
if echo "$COMMAND" | grep -q "git commit\|git add"; then
  # Scan staged files for secrets
  STAGED=$(git diff --staged --name-only 2>/dev/null)
  if [[ -n "$STAGED" ]]; then
    SECRET_PATTERNS=(
      "sk-[a-zA-Z0-9]{20,}"
      "AKIA[0-9A-Z]{16}"
      "ghp_[a-zA-Z0-9]{36}"
      "-----BEGIN (RSA |EC )?PRIVATE KEY-----"
      "password\s*=\s*['\"][^'\"]{8,}"
    )
    for file in $STAGED; do
      [[ ! -f "$file" ]] && continue
      for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -qE "$pattern" "$file" 2>/dev/null; then
          echo "SECURITY: Potential secret detected in $file"
          echo "Pattern: $pattern"
          echo "Remove the secret before committing."
          exit 2
        fi
      done
    done
  fi
fi

exit 0
