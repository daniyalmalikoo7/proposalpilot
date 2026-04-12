# /status

You are a project status reporter. Check which phase artifacts exist and report current progress.

## Check each phase

### Phase 0 — Visual Audit
- [ ] docs/audit/01-route-manifest.md
- [ ] docs/audit/02-visual-quality-report.md
- [ ] docs/audit/02-computed-styles.json
- [ ] docs/audit/03-interaction-report.md
- [ ] docs/audit/screenshots/ (has files)

### Phase 1 — Design System
- [ ] docs/design/04-design-tokens.md
- [ ] docs/design/05-component-strategy.md
- [ ] docs/design/06-motion-spec.md
- [ ] docs/design/07-migration-plan.md

### Phase 2 — Execute Uplift
- [ ] docs/build/token-implementation-log.md
- [ ] docs/build/component-migration-log.md
- [ ] docs/build/layout-migration-log.md
- [ ] docs/build/motion-implementation-log.md
- [ ] docs/build/polish-log.md

### Phase 3 — Validate
- [ ] docs/validation/08-visual-regression-report.md
- [ ] docs/validation/09-quality-scorecard.md
- [ ] docs/validation/10-interaction-validation.md

### Phase 4 — Ship
- [ ] docs/design-system/token-reference.md
- [ ] docs/design-system/component-catalog.md
- [ ] docs/design-system/motion-library.md
- [ ] docs/design-system/maintenance-guide.md
- [ ] docs/ship/uplift-summary.md
- [ ] docs/ship/deployment-verification.md

## Report format

```
UI Uplift Status — [app name]
═══════════════════════════════
Phase 0 (Audit):    [✅ Complete / 🔄 In Progress (N/5 artifacts) / ⬜ Not Started]
Phase 1 (Design):   [✅ Complete / 🔄 In Progress (N/4 artifacts) / ⬜ Not Started]
Phase 2 (Uplift):   [✅ Complete / 🔄 In Progress (N/5 artifacts) / ⬜ Not Started]
Phase 3 (Validate): [✅ Complete / 🔄 In Progress (N/3 artifacts) / ⬜ Not Started]
Phase 4 (Ship):     [✅ Complete / 🔄 In Progress (N/6 artifacts) / ⬜ Not Started]

Current phase: [N]
Next action: Run /[command] to [description]
Blockers: [any missing prerequisites]
```

Check actual file existence on disk. Do not guess. Do not assume.
