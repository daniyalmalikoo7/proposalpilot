# /design

You are the Phase 1 orchestrator. Phase 0 produced gap reports. Your job is to set the aesthetic direction, design the target system, and produce the migration plan — all before any code changes.

## Pre-flight

Verify Phase 0 is complete:
1. docs/audit/00-surface-map.md exists
2. docs/audit/01-route-manifest.md exists
3. docs/audit/02-visual-quality-report.md exists
4. docs/audit/03-interaction-report.md exists

If missing: "Phase 0 is incomplete. Run /audit first." Stop.

Update phase.json: phase 1 status "in-progress", startedAt now.

## Aesthetic Direction (FIRST — before any design work)

Ask the user to set the project profile (or suggest based on the surface map):

```
APP_TYPE:          [saas-dashboard | marketing-site | editorial | e-commerce | admin-panel | creative-portfolio]
VISUAL_TONE:       [clinical-minimal | warm-refined | bold-editorial | playful-friendly | luxury-premium | industrial-utilitarian]
MOTION_LEVEL:      [static | subtle | standard | expressive | cinematic]
DENSITY:           [spacious | balanced | compact | dense]
BRAND_PERSONALITY: [2-3 adjectives]
```

Produce docs/design/04a-aesthetic-direction.md with the profile + typography/color/motion decisions that follow from it (reference @.claude/skills/aesthetic-direction.md for the decision framework).

Update phase.json projectProfile with the chosen values.

## Agent Sequence

1. Design System Architect (@.claude/agents/phase-1/design-system-architect.md)
   Produce: docs/design/04-design-tokens.md
   Must READ docs/design/04a-aesthetic-direction.md before designing tokens.
   Done when: complete token spec with actual Tailwind config code and CSS custom properties.
   **Checkpoint:** Verify file has ```typescript code block and >60 lines.

2. Component Strategist (@.claude/agents/phase-1/component-strategist.md)
   Produce: docs/design/05-component-strategy.md
   Must reference aesthetic direction for keep/improve/replace decisions.
   Done when: every component inventoried with migration decision and state specs.
   **Checkpoint:** Verify file has migration matrix table and >40 lines.

3. Motion & Animation Designer (@.claude/agents/phase-1/motion-designer.md)
   Produce: docs/design/06-motion-spec.md
   Must calibrate to MOTION_LEVEL from aesthetic direction.
   Done when: complete motion tokens with Framer Motion code.
   **Checkpoint:** Verify file has motion token table and code blocks and >50 lines.

4. Migration Planner (@.claude/agents/phase-1/migration-planner.md)
   Produce: docs/design/07-migration-plan.md
   Done when: ordered steps with devil's advocate challenge and PROCEED/RECONSIDER decision.
   **Checkpoint:** Verify file has "Decision:" line and >40 lines.

## Phase gate check

- [ ] docs/design/04a-aesthetic-direction.md exists with project profile
- [ ] docs/design/04-design-tokens.md exists with actual code
- [ ] docs/design/05-component-strategy.md exists with matrix
- [ ] docs/design/06-motion-spec.md exists with tokens + code
- [ ] docs/design/07-migration-plan.md exists with PROCEED decision

Update phase.json: phase 1 complete.

## On completion

Report: token count, component strategy summary, motion patterns, migration steps, devil's advocate decision.
"Review the design specs in docs/design/. If you approve, run /uplift to begin Phase 2."
User reviews and approves. This is USER DECISION #2.
