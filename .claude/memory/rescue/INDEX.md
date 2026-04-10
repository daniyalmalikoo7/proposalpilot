# Rescue Agent Memory — Index

This is the cross-project memory sanctum for the rescue workflow. It persists learnings across different codebase rescues.

## Structure

```
.claude/memory/rescue/
├── INDEX.md          ← You are here. Map of the sanctum.
├── MEMORY.md         ← Curated long-term knowledge (<200 lines). Loaded every session.
└── sessions/         ← Raw session logs. Never loaded on session start.
    └── YYYY-MM-DD.md ← Append-only logs per rescue session.
```

## How Memory Works

1. **Session logs** are written automatically by `session-end.sh` to `docs/memory/sessions/` (project-specific) and optionally here (cross-project).
2. **MEMORY.md** is curated by the Rescue Synthesizer agent at the end of Phase 4. It extracts patterns from session logs and the rescue-learnings.md file.
3. **Token discipline**: MEMORY.md must stay under 200 lines. Every line must earn its place. Prune aggressively.
4. **Session logs** older than 14 days are pruned once their value has been captured in MEMORY.md.

## What Goes in MEMORY.md

- Stack-specific patterns that recur across 2+ rescues
- Tool effectiveness notes (which tools find real issues vs false positives)
- Time estimate calibration data (estimated vs actual hours)
- Common fix patterns that work reliably
- Anti-patterns: fixes that seemed to work but caused regressions

## What Does NOT Go in MEMORY.md

- Project-specific details (those go in docs/memory/rescue-learnings.md per project)
- Raw findings or error messages
- Anything that could be re-derived from running the tools
