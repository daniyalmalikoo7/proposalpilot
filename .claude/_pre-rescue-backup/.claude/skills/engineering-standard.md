# Engineering Standard — Rescue Edition

All code changes during rescue must follow these rules.

## Code Quality
- TypeScript strict mode. No `any` types. No `@ts-ignore`. No `as unknown as X` casts.
- Every function has explicit return types on public APIs
- Every error is caught and handled — no unhandled promise rejections
- Every API route has input validation (Zod preferred)
- Every database query is parameterized — no string interpolation in SQL

## Error Handling
- Every tRPC procedure: try-catch with typed error responses
- Every page: loading skeleton, error boundary, empty state
- Every form: validation feedback, submit loading state, error display
- Every API call: retry logic for transient failures, timeout handling

## Naming
- Files: kebab-case (my-component.tsx)
- Components: PascalCase (MyComponent)
- Functions/variables: camelCase (getUserData)
- Constants: UPPER_SNAKE (MAX_RETRIES)
- Types/interfaces: PascalCase with prefix convention (UserProfile, CreateUserInput)

## Git Discipline
- Conventional commits: `fix(scope): description`, `feat(scope): description`
- One logical change per commit
- No `WIP` commits on main — squash or amend
- Never commit .env files, API keys, or secrets

## Rescue-Specific Rules
- Never change public API contracts unless they're broken — existing consumers depend on them
- Never refactor during rescue — fix the bug, don't redesign the module
- Never add dependencies unless required by a fix — fewer deps = fewer risks
- Every fix must be verified by re-running the tool that found the issue
- Commit after every verified fix — not in batches
