\# SKILL.md



\## Purpose



You are an engineering agent working on \*\*CGVPremiumFE\*\*, a React + TypeScript cinema management system.



Your goal is to implement requested changes \*\*correctly\*\*, \*\*safely\*\*, and \*\*consistently\*\* with the existing architecture.



You must \*\*never invent requirements, business rules, or API contracts.\*\*



\---



\# Core Principles



1\. \*\*Never assume requirements.\*\* If a requirement is ambiguous, incomplete, or has multiple valid interpretations — stop, ask, wait.

2\. \*\*Preserve existing behavior.\*\* Don't touch unrelated features, refactor unrelated code, rename APIs, move files, or "improve" code that wasn't part of the request.

3\. \*\*Reuse existing patterns.\*\* Before creating a hook, component, service, utility, table, modal, form, validation schema, or query hook — search the project for an existing one first.

4\. \*\*Smallest correct change wins.\*\* Prefer the minimal diff that satisfies the request over the more "complete" refactor you might be tempted to do.



Examples:



"I think Manager should also have this permission."

"Currently only Admin has this action. Should Manager also have access?"



Assuming: "COMING\_SOON movies cannot be booked."

&#x20;Asking: "Should COMING\_SOON movies allow showtime creation?"



\---



\# Before Implementing — Investigation Workflow



For every request, in order:



1\. \*\*Locate the existing implementation\*\* (or nearest analog) before writing anything.

2\. \*\*Grep/search for reusable code\*\* — hooks, services, schemas, components — rather than assuming none exists.

3\. \*\*Read neighboring files\*\* in the same feature folder to match conventions (naming, file layout, error handling, query key shape).

4\. \*\*Identify all affected modules\*\* (routes, store slices, shared types, other features consuming the same API).

5\. Only then implement.



Do not skip straight to writing code because the task "seems simple" — the fastest wrong implementation still costs more than a 30-second search.



\---



\# Project Architecture



Feature-based:



```

src/

&#x20;   features/       # domain logic, grouped by feature (e.g. features/movie, features/booking)

&#x20;   components/      # shared, cross-feature UI components

&#x20;   layouts/

&#x20;   routes/

&#x20;   services/        # API clients

&#x20;   store/           # Redux slices (global/auth state)

&#x20;   hooks/           # shared hooks

&#x20;   utils/

&#x20;   constants/

&#x20;   types/

```



Within a feature folder, follow the existing internal structure (e.g. `features/movie/{api,hooks,components,types}`) rather than inventing a new shape for a new feature.



\---



\# Technology Stack



React 19 · TypeScript · Vite · Redux Toolkit · React Query · React Router DOM · Axios · Ant Design · Zod



Use only what's already used in the project. Do not introduce a new dependency, even a popular one, without an explicit request — check `package.json` first if unsure whether something is already available.



\---



\# Coding Conventions



\*\*TypeScript\*\* — explicit types, interfaces, existing shared types. Avoid `any` and unnecessary type assertions.



\*\*React\*\* — functional components, hooks, composition. No class components.



\*\*State\*\* — React Query for server state, Redux for auth/global state. Don't duplicate state across the two.



\*\*Forms\*\* — reuse existing form components, Zod schemas, and validation layouts. When adding a field, mirror backend validation on the frontend if backend validation already exists for it. Don't build a parallel form pattern when one exists in the feature.



\*\*API calls\*\* — always go through an existing service; never call Axios directly from a page/component if a service already exists for that resource.



\*\*Routing\*\* — reuse existing route guards; don't duplicate authorization logic in a new place.



\*\*React Query\*\* — reuse existing query keys where present; invalidate only the queries actually affected by the change; avoid introducing unnecessary refetches.



\*\*Tables\*\* — when modifying, preserve existing pagination, filtering, sorting, loading, and empty states. Don't rewrite the table to add one column.



\*\*Error handling\*\* — reuse existing notification utilities, message components, error boundaries, and loading states. A new error path should look like the rest of the app, not introduce a new UX pattern.



\*\*Performance\*\* — avoid unnecessary re-renders, duplicated API calls, duplicated state. Follow existing memoization patterns only where the codebase already uses them — don't introduce `useMemo`/`useCallback` as a drive-by "optimization."



\---



\# UI Guidelines



Maintain consistency with existing pages. Reuse Ant Design components, shared components, and established table/modal/page-layout styles. Don't introduce a different visual style for a single feature.



\---



\# Testing



If the project already has tests covering the area you're touching, update them to match your change and follow the existing test structure/framework — don't introduce a different testing approach.



If no tests exist for the area, do not invent a testing setup unprompted. Ask whether tests are expected for this change.



\---



\# Version Control



\- Never run destructive git commands (`reset --hard`, `push --force`, `checkout` that discards uncommitted work) without explicit confirmation.

\- Don't commit unrelated changes together with the requested change.

\- Write commit messages that describe the actual change, not the ticket restated.

\- If a change touches `package.json`/lockfiles, call that out explicitly — dependency changes are high-risk by default.



\---



\# Confirmation Required Before Proceeding



Stop and confirm with the user before implementing changes that:



\- Alter authentication/authorization flow or route guards.

\- Change a shared/global Redux slice consumed by multiple features.

\- Modify a shared component or hook used across multiple features (vs. a feature-local one).

\- Change an API contract or shape consumed elsewhere.

\- Remove or hide an existing UI action rather than just the one requested.



These are the changes most likely to have effects outside the file you're editing.



\---



\# Token Efficiency



\- Keep the system prompt/context stable across a session — avoid re-reading files you've already inspected unless they've changed.

\- Scope investigation to the feature(s) actually affected; don't traverse the whole `src/` tree for a single-component change.

\- Prefer targeted reads (specific files, specific line ranges) over dumping entire directories when you already know roughly where the relevant code lives.

\- Keep command output lean — avoid verbose build/test output in context when a pass/fail summary is sufficient.



\---



\# When Requirements Are Unclear



Ask, don't guess. Common examples worth asking about explicitly:



\- Which roles should have access?

\- Should this affect existing records, or only new ones?

\- Is this frontend-only, or does it need a backend change too?

\- Should validation happen before submit, or rely on backend response?

\- Should a hidden/disallowed action be removed from the UI, or shown-but-disabled?

\- Should existing data be migrated?

\- What exact error message should the user see?



Do not proceed until ambiguity is resolved.



\---



\# Response Format



Scale the response to the size of the change.



\*\*Small/isolated fix\*\* (single file, no cross-feature impact): a short summary of what changed and why is enough.



\*\*Larger or cross-cutting change\*\*, include:



\## Summary

Brief description.



\## Files Modified

List every modified file.



\## Reasoning

Why each change was needed.



\## Potential Impact

Affected pages, routes, or modules.



\## Follow-up

Any additional work that may be required.



\---



\# Absolute Rules



Never:



\- Invent requirements, business rules, API contracts, permissions, or validation rules.

\- Silently change behavior outside the scope of the request.

\- Perform unrelated refactors.

\- Run destructive git operations without explicit confirmation.

\- Add a new dependency without being asked.



When in doubt: \*\*Stop. Ask. Wait. Then implement.\*\*



Correctness is more important than speed.

