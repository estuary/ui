# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites

- Node.js >= 20, npm ^10 (defined in `package.json`)
- [Estuary](https://github.com/estuary/flow) installed and running locally
- GitHub authentication token in `~/.npmrc` for `@estuary/flow-web` package:
    ```
    //npm.pkg.github.com/:_authToken=YOUR_TOKEN
    @estuary:registry=https://npm.pkg.github.com/
    ```

## Common Commands

### Development

```bash
npm install              # Install dependencies
npm start               # Start dev server at localhost:3000 (runs licenses check first)
```

### Code Quality

```bash
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Check Prettier formatting
npm run format:fix      # Auto-fix formatting
npm run typecheck       # Run TypeScript compiler checks
npm run licenses        # Check dependency licenses
```

### Testing

```bash
npm test                # Run Vitest in watch mode
npm run test:ui         # Run Vitest with UI
npm run test:debug      # Debug tests with inspector
```

### Type Generation

```bash
npm run generate-flow-types         # Generate types from estuary/flow (requires Flow installed)
```

### Vendored Dependencies

```bash
npm run hack-in-web-flow           # Use to pull latest @estuary/flow-web build
npm run hack-in-local-web-flow     # Use local @estuary/flow-web build
npm run hack-in-dpg                # Use local data-plane-gateway build
```

## High-Level Architecture

### State Management

Three layers: React Context (top-level concerns), Zustand stores (domain state), and SWR (REST fetching). Stores are composed from slices and accessed via pre-made hooks (moving away from inline `useShallow` selectors as of Q1 2026).

See `docs/STATE.md` for store composition, hydration patterns, workflow state machines, and binding index tracking.

See `docs/REACT.md` for React-specific patterns (context, hooks, code splitting, error boundaries).

### Data Fetching

- **GraphQL (URQL)** — preferred for all new data fetching; real-time alerts, live specs, shard status
- **PostgREST (Supabase)** — batch operations (drafts, publications, entity lists); wrapped in `src/api/`
- **WebAssembly (`@estuary/flow-web`)** — client-side validation: `evaluate_field_selection()`, `update_materialization_resource_spec()`, `get_resource_config_pointers()`

See `docs/GRAPHQL.md` for migration status and URQL patterns.

### Authentication

Supabase auth with JWT refresh, SSO, magic link, and access grant token support. Auth state flows from Supabase → `UserStore` (Zustand) → `RequireAuth` route guards.

See `docs/AUTH.md` for the full auth flow, provider nesting order, and JWT refresh strategy.

### Routing & Code Splitting

Routes defined in `src/app/routes.ts` with two top-level objects:

- `authenticatedRoutes`: Protected routes wrapped by `RequireAuth` and `AuthenticatedLayout`
- `unauthenticatedRoutes`: Login, registration, SSO flows

All lazy-loaded routes and `<Suspense>` boundaries are centralized in `src/context/Router/index.tsx`.

See `docs/ROUTING.md` for the full route structure, guards, and URL param conventions.

### JSON Forms

Custom renderer pipeline for connector configuration forms. Takes a connector JSON schema, generates a UI schema, applies custom renderers (OAuth, Duration, Discriminator), and binds to Zustand store data.

See `docs/JSONFORMS.md` for the full pipeline, custom annotations, renderers, and AJV validation setup.

### UI / MUI

MUI v7 with a custom theme in `src/context/Theme.tsx`. Prefer exported theme tokens over hardcoded values. Use `slots`/`slotProps` (not `components`/`componentsProps`). Prefer `iconoir-react` over `@mui/icons-material`.

See `docs/MUI.md` for theme tokens, conventions, and known gotchas.

### i18n

`react-intl` with English-only messages in `src/lang/en-US/`. Missing keys are logged to LogRocket.

See `docs/I18N.md` for message file structure, usage patterns, and naming conventions.

### Error Handling

Four layers: React error boundaries, store hydration errors, form validation (AJV), and API call errors. All error display flows through `<AlertBox>` and logs to LogRocket.

See `docs/ERROR_HANDLING.md` for the full error flow and display components.

### External Integrations

Supabase (auth + database), GraphQL server, Data-Plane-Gateway, Monaco Editor, LogRocket.

See `docs/INTEGRATIONS.md` for setup details and critical initialization order requirements.

### Build

Vite with plugins for ESLint/TS checking, circular dependency detection, WASM support, and SRI hashing.

See `docs/BUILD.md` for plugin details.

### Key Directory Structure

- `src/api/`: Supabase REST query wrappers (entities, drafts, publications, connectors)
- `src/components/`: UI components organized by feature (capture, materialization, collection, tables, shared)
- `src/context/`: React Context providers (User, Router, SWR, URQL, Theme, Notifications)
- `src/forms/`: JSON Forms custom renderers and overrides
- `src/hooks/`: Custom hooks organized by domain (connectors, bindings, journals, searchParams)
- `src/services/`: Shared logic and wrappers for external dependencies (AJV setup, Supabase utilities, UI schema generation, GraphQL helpers)
- `src/stores/`: Zustand stores (Binding, Entities, Workflow, FormState, JournalData)
- `src/types/`: TypeScript types (GraphQL, JSON Forms, WASM, schema models)
- `src/utils/`: Shared logic in basic functions organized by target (billing, schema, workflow)

## Important Patterns & Conventions

### Provider Nesting Order (Important!)

See `docs/AUTH.md` for the full nesting order. Critical rules:

- LogRocket initializes **before** Supabase client creation
- `UrqlConfigProvider` must be inside `UserStoreProvider`
- Monaco workers are configured in `src/index.tsx` before React renders

## Common Gotchas

1. **Encrypted fields break discriminator matching**: Use custom logic in `src/forms/shared.ts` that matches by discriminator value alone — see `docs/JSONFORMS.md`
1. **Store active flag**: Set `store.setActive(false)` on unmount to prevent unnecessary hydration. Eventually this should be replaced by cleaning up / cancelling ongoing calls during unmount.
1. **LogRocket before Supabase**: LogRocket must initialize first to capture Supabase network requests — see `docs/INTEGRATIONS.md`
1. **Monaco workers**: Must be configured before React renders (done in `src/index.tsx`) — see `docs/INTEGRATIONS.md`
1. **Data plane token refresh**: Check `shouldRefreshToken()` on errors and re-authenticate before retry — see `docs/INTEGRATIONS.md`
1. **Trial collections**: Cannot be deleted, have special handling in `useTrialCollections()` hook
1. **Binding UUID tracking**: Use correct index mapping when cross-referencing errors between client/server state — see `docs/STATE.md`

## Testing

See `docs/TESTING.md` for detailed test scenarios (connector edge cases, create/edit workflows, binding variations).

- **Unit tests**: Vitest + jsdom, located at `src/**/__tests__/*.test.ts`
- **E2E tests**: Playwright, located in `playwright-tests/` (intended to become a standalone project)

## GraphQL Migration

Currently migrating from PostgREST to GraphQL for select features. See `docs/GRAPHQL.md` for details and current status.

### Gotchas

1. **GraphQL cache disabled for real-time types**: Alerts/LiveSpecRef return `null` for cache key to always fetch fresh for now — see `docs/GRAPHQL.md`

## Ongoing Refactoring and Migrations

This list is a work in progress and not complete by any means.
Some of this is called out in the docs.

1. Moving to strict state machines
2. Replacing PostgREST to GQL
3. Moving broken up Zustand states into a single one or two stores
