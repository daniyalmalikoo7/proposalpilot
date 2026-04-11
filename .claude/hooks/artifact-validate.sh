#!/bin/bash
# .claude/hooks/artifact-validate.sh
# Three-tier artifact validation: BLOCK (exit 2), WARN (exit 0 + message), PASS (exit 0 clean).
# Checks artifact QUALITY, not just existence.
# Fires on Stop event to validate work products.

DOCS_DIR="docs"
WARNINGS=()
BLOCKS=()

validate_artifact() {
  local file="$1"
  local min_lines="$2"
  local required_pattern="$3"
  local description="$4"

  if [[ ! -f "$file" ]]; then
    return  # File doesn't exist yet — not a failure during in-progress work
  fi

  # BLOCK: File is empty or stub (<10 lines)
  local line_count
  line_count=$(wc -l < "$file" 2>/dev/null | tr -d ' ')
  if [[ "$line_count" -lt 10 ]]; then
    BLOCKS+=("$file: only $line_count lines — appears to be a stub. $description needs ≥$min_lines lines.")
    return
  fi

  # WARN: File below minimum depth
  if [[ "$line_count" -lt "$min_lines" ]]; then
    WARNINGS+=("$file: $line_count lines (expected ≥$min_lines). May lack sufficient depth.")
  fi

  # WARN: Missing expected content pattern
  if [[ -n "$required_pattern" ]]; then
    if ! grep -qiE "$required_pattern" "$file"; then
      WARNINGS+=("$file: expected pattern '$required_pattern' not found. May be missing key section.")
    fi
  fi
}

# Phase 0 artifacts
validate_artifact "docs/audit/01-route-manifest.md" 20 "route|screenshot|viewport" "Route manifest"
validate_artifact "docs/audit/02-visual-quality-report.md" 50 "critical|high|medium|low|severity|principle" "Visual quality report"
validate_artifact "docs/audit/03-interaction-report.md" 30 "hover|focus|active|disabled|keyboard|axe" "Interaction report"

# Phase 1 artifacts
validate_artifact "docs/design/04-design-tokens.md" 60 "tailwind|config|color|spacing|token" "Design tokens"
validate_artifact "docs/design/05-component-strategy.md" 40 "keep|improve|replace|custom|migration|component" "Component strategy"
validate_artifact "docs/design/06-motion-spec.md" 50 "duration|easing|spring|motion|animation|framer" "Motion spec"
validate_artifact "docs/design/07-migration-plan.md" 40 "proceed|reconsider|step|migration|rollback" "Migration plan"

# Phase 2 artifacts
validate_artifact "docs/build/token-implementation-log.md" 15 "token|tailwind|modified|implemented" "Token log"
validate_artifact "docs/build/component-migration-log.md" 20 "component|migrated|improved|replaced" "Component log"
validate_artifact "docs/build/layout-migration-log.md" 15 "layout|responsive|viewport|container" "Layout log"
validate_artifact "docs/build/motion-implementation-log.md" 15 "animation|motion|framer|transition" "Motion log"

# Phase 3 artifacts
validate_artifact "docs/validation/08-visual-regression-report.md" 20 "pass|fail|regression|before|after" "Visual regression"
validate_artifact "docs/validation/09-quality-scorecard.md" 30 "before|after|score|improvement|lighthouse" "Quality scorecard"
validate_artifact "docs/validation/10-interaction-validation.md" 20 "hover|focus|keyboard|axe|state" "Interaction validation"

# Report results
if [[ ${#BLOCKS[@]} -gt 0 ]]; then
  echo "ARTIFACT VALIDATION: BLOCKED"
  echo "The following artifacts are stubs or empty:"
  printf '  ❌ %s\n' "${BLOCKS[@]}"
  echo ""
  echo "Re-run the current agent to produce complete artifacts."
  exit 2
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo "ARTIFACT VALIDATION: WARNINGS"
  printf '  ⚠️  %s\n' "${WARNINGS[@]}"
  echo ""
  echo "Artifacts exist but may lack depth. Review and enhance if needed."
  exit 0
fi

# Clean pass — no output needed
exit 0
