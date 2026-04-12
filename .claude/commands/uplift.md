# /uplift

You are the Phase 2 orchestrator for UI/UX uplift. Phase 1 produced the design specs. Your job is to execute the migration plan step by step — tokens first, then components, then layout, then motion and polish. Each step is verified before proceeding to the next.

## Pre-flight

Before starting, verify Phase 1 is complete:
1. docs/design/04-design-tokens.md exists
2. docs/design/05-component-strategy.md exists
3. docs/design/06-motion-spec.md exists
4. docs/design/07-migration-plan.md exists with PROCEED decision

If any are missing or decision is RECONSIDER, say: "Phase 1 is incomplete or decision is RECONSIDER. Run /design first or address the conditions." and stop.

## Sequence

Follow the migration order from docs/design/07-migration-plan.md EXACTLY.

1. Token Engineer (@.claude/agents/phase-2/token-engineer.md)
   Produce: modified tailwind.config.ts + globals.css + docs/build/token-implementation-log.md
   Done when: tokens injected, zero visual regression, build passes

   **Checkpoint:** Verify tailwind.config.ts was modified, build passes (`npm run build`), and app looks identical to before screenshots.
   If build fails, fix before proceeding. This step MUST NOT change the visual appearance.

2. Component Engineer (@.claude/agents/phase-2/component-engineer.md)
   Produce: modified component files + docs/build/component-migration-log.md
   Done when: all components migrated per strategy, using tokens, all states present

   **Checkpoint:** Verify `npx tsc --noEmit` and `npm run lint` pass clean.
   If TypeScript errors, fix before proceeding.

3. Layout & Responsiveness Engineer (@.claude/agents/phase-2/layout-engineer.md)
   Produce: modified layout files + docs/build/layout-migration-log.md
   Done when: consistent page containers, responsive at 3 viewports, no white-space gaps

   **Checkpoint:** Verify all routes render at 3 viewports without overflow or broken layouts.

4. Motion & Polish Engineer (@.claude/agents/phase-2/motion-polish-engineer.md)
   Produce: modified files with animations + docs/build/motion-implementation-log.md + docs/build/polish-log.md
   Done when: all motion patterns applied, polish pass complete, performance not degraded

   **Checkpoint:** Verify `npm run build` passes, Lighthouse performance not degraded >5 points.

## Phase gate check

Before completing, verify:
- [ ] docs/build/token-implementation-log.md exists
- [ ] docs/build/component-migration-log.md exists
- [ ] docs/build/layout-migration-log.md exists
- [ ] docs/build/motion-implementation-log.md exists
- [ ] docs/build/polish-log.md exists
- [ ] `npx tsc --noEmit` passes clean
- [ ] `npm run lint` passes clean (or is not configured)
- [ ] `npm run build` passes clean

## On completion

Report:
- Files modified: [total count]
- Components migrated: [N improved, N replaced, N custom]
- Layout fixes applied: [N routes restructured]
- Animations implemented: [N patterns]
- Polish fixes: [N items]
- Build status: tsc ✅, lint ✅, build ✅
- "Run /validate to begin Phase 3 — before/after evidence generation."
