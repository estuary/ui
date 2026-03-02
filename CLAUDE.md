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
npm run preview         # Build and preview production mode
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

### Local Development Hacks

```bash
npm run hack-in-web-flow           # Use to pull latest @estuary/flow-web build
npm run hack-in-local-web-flow     # Use local @estuary/flow-web build
npm run hack-in-dpg                # Use local data-plane-gateway build
```

## High-Level Architecture

### State Management

Three layers: React Context (top-level concerns), Zustand stores (domain state), and SWR (REST fetching). Stores are composed from slices and consumed with `useShallow` selectors.

See `docs/STATE.md` for store composition, hydration patterns, workflow state machines, and binding index tracking.

See `docs/REACT.md` for React-specific patterns (context, hooks, code splitting, error boundaries).

### Data Fetching

- **GraphQL (URQL)** — preferred for all new data fetching; real-time alerts, live specs, shard status
- **PostgREST (Supabase)** — batch operations (drafts, publications, entity lists); wrapped in `src/api/`
- **WebAssembly (`@estuary/flow-web`)** — client-side validation: `evaluate_field_selection()`, `update_materialization_resource_spec()`, `get_resource_config_pointers()`

See `docs/GRAPHQL.md` for migration status and URQL patterns.

### Routing & Code Splitting

Routes defined in `src/app/routes.ts` with two top-level objects:

- `authenticatedRoutes`: Protected routes wrapped by `RequireAuth` and `AuthenticatedLayout`
- `unauthenticatedRoutes`: Login, registration, SSO flows

All lazy-loaded routes and `<Suspense>` boundaries are centralized in `src/context/Router/index.tsx`.

### JSON Forms

Custom renderer pipeline for connector configuration forms. Takes a connector JSON schema, generates a UI schema, applies custom renderers (OAuth, Duration, Discriminator), and binds to Zustand store data.

See `docs/JSONFORMS.md` for the full pipeline, custom annotations, renderers, and AJV validation setup.

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

Specific order required for dependencies:

to be documented later

## Common Gotchas

1. **Encrypted fields break discriminator matching**: Use custom logic in `src/forms/shared.ts` that matches by discriminator value alone — see `docs/JSONFORMS.md`
2. **GraphQL cache disabled for real-time types**: Alerts/LiveSpecRef return `null` for cache key to always fetch fresh for now
3. **Store active flag**: Set `store.setActive(false)` on unmount to prevent unnecessary hydration. Eventually this should be replaced by cleaning up / cancelling ongoing calls during unmount.
4. **LogRocket before Supabase**: LogRocket must initialize first to capture Supabase network requests — see `docs/INTEGRATIONS.md`
5. **Monaco workers**: Must be configured before React renders (done in `src/index.tsx`) — see `docs/INTEGRATIONS.md`
6. **Data plane token refresh**: Check `shouldRefreshToken()` on errors and re-authenticate before retry — see `docs/INTEGRATIONS.md`
7. **Trial collections**: Cannot be deleted, have special handling in `useTrialCollections()` hook
8. **Binding UUID tracking**: Use correct index mapping when cross-referencing errors between client/server state — see `docs/STATE.md`

## Testing

See `docs/TESTING.md` for detailed test scenarios (connector edge cases, create/edit workflows, binding variations).

- **Unit tests**: Vitest + jsdom, located at `src/**/__tests__/*.test.ts`
- **E2E tests**: Playwright, located in `playwright-tests/` (intended to become a standalone project)

## GraphQL Migration

Currently migrating from PostgREST to GraphQL for select features. See `docs/GRAPHQL.md` for details and current status.

## Ongoing Refactoring and Migrations

This list is a work in progress and not complete by any means.
Some of this is called out in the docs.

1. Moving to strict state machines
2. Replacing PostgREST to GQL
3. Moving broken up Zustand states into a single one or two stores
