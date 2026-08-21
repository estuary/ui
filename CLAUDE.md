# CLAUDE.md

Guidance for Claude Code in this repository. Setup and local run: see `README.md`.

## Docs Index

Read the matching doc before you work in an area:

- `docs/STATE.md` — Zustand store composition, hydration, workflow state machines, binding index tracking
- `docs/REACT.md` — context, hooks, code splitting, error boundaries
- `docs/GRAPHQL.md` — URQL patterns; PostgREST → GraphQL migration status
- `docs/AUTH.md` — auth flow, provider nesting order, JWT refresh
- `docs/ROUTING.md` — routes (`src/app/routes.ts`), guards, URL param conventions
- `docs/JSONFORMS.md` — connector form renderer pipeline, custom annotations, AJV
- `docs/MUI.md` — theme tokens, conventions, gotchas
- `docs/I18N.md` — react-intl retirement rules and the wrapper migration scaffold
- `docs/ERROR_HANDLING.md` — error flow, display components
- `docs/INTEGRATIONS.md` — Supabase, Data-Plane-Gateway, Monaco, LogRocket; initialization order
- `docs/BUILD.md` — Vite plugins
- `docs/TESTING.md` — test scenarios; Vitest unit tests in `src/**/__tests__/`, Playwright E2E in `playwright-tests/`
- `docs/ENV.md` — env var files and load order
- `docs/INFINITE_LOOP_PATTERNS.md` — Zustand selector patterns that cause infinite renders

## Conventions

- New data fetching uses GraphQL (URQL). PostgREST (`src/api/`) remains for existing batch operations.
- Access Zustand state through pre-made hooks, not inline `useShallow` selectors.
- MUI v7: consume existing tokens from `src/context/Theme.tsx` rather than hardcoding values; add new tokens to the augmented theme (`docs/MUI.md`). Use `slots`/`slotProps`, not `components`/`componentsProps`. Use `iconoir-react`, not `@mui/icons-material`.
- Use named exports for new components and modules.

## Gotchas

- Provider order: LogRocket initializes before the Supabase client. `UrqlConfigProvider` sits inside `UserStoreProvider`. Monaco workers are configured in `src/index.tsx` before React renders.
- Encrypted fields break discriminator matching. Use the matcher in `src/forms/shared.ts`.
- Set `store.setActive(false)` on unmount to prevent unnecessary hydration.
- On data-plane errors, check `shouldRefreshToken()` and re-authenticate before retry.
- Trial collections cannot be deleted; `useTrialCollections()` handles them.
- Use the correct binding index mapping when you cross-reference client and server errors — see `docs/STATE.md`.
- GraphQL cache is disabled for Alerts/LiveSpecRef (cache key returns `null`) so they always fetch fresh.

## In-Flight Migrations

- PostgREST → GraphQL (`docs/GRAPHQL.md`)
- react-intl removal (`docs/I18N.md`) — no new usage; keep the named-export + deprecated-wrapper scaffold intact
- Design tokens: new tokens go in the augmented MUI theme; the loose exported consts in `src/context/Theme.tsx` migrate to theme keys over time (`docs/MUI.md`)
- `src/components/inputs/PrefixedName/` is freeze-and-replace: do not modify it, even for small fixes; migrate consumers to simpler replacements, then delete it
- Under review since the June 2026 direction change: strict workflow state machines, Zustand store consolidation. Confirm these still hold before you push code toward them.
