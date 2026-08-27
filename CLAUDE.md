# CLAUDE.md

Guidance for Claude Code in this repository. Setup and local run: see `README.md`.

## Docs Index

Read the matching doc before you work in an area:

- `docs/STATE.md` — Zustand store composition, hydration, workflow state machines
- `docs/REACT.md` — context, hooks, code splitting, error boundaries
- `docs/GRAPHQL.md` — URQL patterns; PostgREST → GraphQL migration status
- `docs/ROUTING.md` — routes (`src/app/routes.ts`), guards, URL param conventions
- `docs/JSONFORMS.md` — connector form renderer pipeline, custom annotations, AJV
- `docs/ERROR_HANDLING.md` — error flow, display components
- `docs/INTEGRATIONS.md` — Supabase, Data-Plane-Gateway, Monaco, LogRocket; initialization order
- `docs/BUILD.md` — Vite plugins
- `docs/TESTING.md` — test scenarios; Vitest unit tests in `src/**/__tests__/`, Playwright E2E in `playwright-tests/`
- `docs/ENV.md` — env var files and load order
- `docs/INFINITE_LOOP_PATTERNS.md` — Zustand selector patterns that cause infinite renders

## Conventions / Gotchas

- Read auth state from `useUserStore` (`src/context/User/useUserContextStore.ts`), not `supabaseClient.auth.getUser()`.
- Encrypted fields break discriminator matching. Use the matcher in `src/forms/shared.ts`.
- Hydrated stores: `setActive(true)` on mount, `setActive(false)` on unmount. Hydration setters silently discard writes while inactive; this stops late fetches from writing stale data into the global store. (This all becomes less relevant as we depend more on graphcache for server data instead of copying into our own stores.)
- On data-plane errors, check `shouldRefreshToken()` and re-authenticate before retry.
- Trial collections cannot be deleted; `useTrialCollections()` handles them.
- Use the correct binding index mapping when you cross-reference client and server errors — see the comments on `ResourceConfig.meta` in `src/stores/Binding/types.ts`.

## In-Flight Migrations

- New code uses named exports; use a default export only where the consumer requires one
- PostgREST → GraphQL (`docs/GRAPHQL.md`)
- Remove `react-intl`: no new message keys in `src/lang/en-US/`; write new copy as plain strings. When you touch a component that uses react-intl, remove the dependency.
- Design tokens: global tokens (values two unrelated components would consume — palette, spacing, radii, z-indexes) go in the augmented MUI theme; component-scoped styling colocates with its component and composes theme tokens rather than raw values. The loose exported consts in `src/context/Theme.tsx` migrate accordingly: theme keys if global, colocation if single-consumer. See header comments in `Theme.tsx`.
- Store narrowing: stores hold client editing/UI state only — server data belongs to URQL graphcache. When you touch a store that mirrors copies results (hydration slices, `useEffect` copies), take the opportunity to narrow its responsibilities rather than extend the pattern.
- Store selectors: select one value per store hook call; multi-field or derived selections live in named hooks in the store's `hooks.ts` (`docs/STATE.md`). When you touch an inline `useShallow` selector, migrate it.
- `src/components/inputs/PrefixedName/` is freeze-and-replace: do not modify it, even for small fixes; migrate consumers to simpler replacements, then delete it
