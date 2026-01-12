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
npm run generate-supabase-types     # Generate types from Supabase schema
npm run generate-flow-types         # Generate Flow catalog types (requires Flow installed)
```

### Local Development Hacks

```bash
npm run hack-in-local-web-flow     # Use local @estuary/flow-web build
npm run hack-in-dpg                # Use local data-plane-gateway build
```

## High-Level Architecture

### State Management

1. **React Context** (top-level concerns): Authentication, routing, theme, notifications
2. **Zustand Stores** (complex domain state): User, entities, forms, bindings, workflows
3. **SWR** (data fetching): REST queries with caching/revalidation

**Store Composition Pattern**: Stores are built from "slices" that provide reusable functionality:

- `getStoreWithHydrationSettings()`: Async data loading from APIs
- `getStoreWithFieldSelectionSettings()`: Field picker state
- `getStoreWithBackfillSettings()`: Backfill configuration
- `getStoreWithToggleDisableSettings()`: Enable/disable toggles

Example from `BindingStore`:

```typescript
getInitialState = (set) => ({
    // Common hydration slice
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    // Binding specific slices
    ...getStoreWithFieldSelectionSettings(set),
    ...getStoreWithTimeTravelSettings(set),
    // ... domain-specific logic
});
```

State mutations use Immer's `produce()` when needing to update multiple values or deeply nested values.

**Store Hooks**: Components should try to rely on direct store hook access:

Initially we premade hooks for everything in stores following the pattern of `use{StoreName}_{property}`:

```
    const active = useBillingStore_active();
    const setActive = useBillingStore_setActive();
```

Currently we are replacing these with directly accessing stores:

```
    const [active, setActive] = useBillingStore((state) => [
        state.active,
        state.setActive,
    ]);
```

If it is fetching a complex piece of state we still premake the hooks (ex: `useBinding_sourceCaptureFlags`)

### Data Fetching Architecture

**GraphQL (URQL)**: Real-time data (alerts, live specs, shard status)

- This is the approach we want to follow for all new data we have to fetch
- Cache strategy: Alerts/LiveSpecRef/PrefixRef have `cacheKey: null` for always-fresh data
- Auth exchange handles JWT refresh (detects expiry 1 minute early)
- Request policy exchange with 30s TTL

**PostgREST (Supabase)**: Batch operations (drafts, publications, entity lists)

- Wrapped in `src/api/` layer for error handling and retry logic
- Integrated with SWR via `@supabase-cache-helpers/postgrest-swr`
- LRU cache with 500-entry limit

**WebAssembly (@estuary/flow-web)**: Client-side validation/transformation

- `evaluate_field_selection()`: Validate field selections locally
- `update_materialization_resource_spec()`: Apply field selections to specs
- `get_resource_config_pointers()`: Extract config paths from schemas

### Routing & Code Splitting

Routes defined in `src/app/routes.ts` with two top-level objects:

- `authenticatedRoutes`: Protected routes wrapped by `RequireAuth` and `AuthenticatedLayout`
- `unauthenticatedRoutes`: Login, registration, SSO flows

Use of `lazy()` for route-level code splitting (captures, materializations, collections, admin pages, etc.)

### JSON Forms Custom Architecture

**Form Generation Pipeline**:

1. Take Flow connector JSON schema
2. Dereference `$ref` pointers
3. Generate UI schema in `src/services/jsonforms/index.ts` (~28KB logic)
4. Apply custom renderers for special fields (OAuth, Duration, Discriminator, DataPlane)
5. Bind to Zustand store data

**Custom Flow Annotations** (defined in `src/types/jsonforms.ts`):

- `secret`: Password/token fields
- `airbyte_secret`: Airbyte-specific secrets
- `advanced`: Grouped advanced options
- `multiline`: Textarea rendering
- `discriminator`: OneOf variant selector

**Custom Renderers** (in `src/forms/renderers/`):

- Nullable types: Adds checkbox for null option
- OAuth: Button triggering OAuth flow with backend token exchange
- Duration: ISO 8601 interval autocomplete and special UX handling
- Discriminator: Handles OneOf selection even when encrypted fields break validation

**Validation**: AJV with custom Flow annotation support configured in `src/services/ajv.ts`

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

### External System Integrations

**Supabase**: PostgreSQL database, Edge Functions and auth

- Single anonymous client created in `GlobalProviders.tsx`
- Auth state synced to `UserStore` via `onAuthStateChange` listener
- Tables: live_specs, draft_specs, publications, tenants, auth_roles
- RPCs: auth_roles, user_info_summary, view_logs, billing_report

**Flow GraphQL Server**: Real-time catalog data

- Configured via `VITE_GQL_URL` environment variable
- Pagination using before/after cursors
- Used for alerts, live spec updates, shard status

**Data-Plane-Gateway**: Task/shard management

- Bundled as local .tgz file in `__inline-deps__/`
- Provides `ShardClient` for journal data (logs, metrics)
- 3-second timeout on `list()` operations

**Monaco Editor**: Code editing for JSON/SQL and rendering schemas, data previews and configs for advanced users

- Workers configured in `src/index.tsx` before React render
- Custom worker setup for JSON language services

**LogRocket**: Provides details to better enable support

- **CRITICAL**: Must initialize before Supabase client to capture network requests
- Initialized in `GlobalProviders.tsx`

## Important Patterns & Conventions

### Store Hydration Patterns

#### Hydaring without GQL

Stores implement `StoreWithHydration` interface:

```typescript
interface StoreWithHydration {
    hydrated: boolean;
    hydrateState: () => Promise<void> | void;
    hydrationError: string | null;
    active: boolean; // Set to false to prevent hydration
}
```

Components call `store.hydrateState()` on mount to load initial data.

#### Hydration with GQL

We do not load in everything to a store when using GQL. That way we can utilize Graph Caching

### Workflow State Machine

Older forms use explicit `FormStatus` enum (INIT, SAVING, SAVED, TESTING, TESTED, FAILED, etc.).

- The order of these steps is usually freely changed
- There are some exceptions to prevent this a good example is `setFormState`
- The primary failure of this was adding new steps into the flow and ensuring order of steps

Newer approach is to use a more strict state machine where the order of steps is more closely controlled

- We have implemented custom state machines
- Also considering using XState or another out of the box state machine

UI responds to status changes for spinners, error messages, CTAs.

### Multi-Workflow Support

Different entity creation flows:

- `capture_create` / `capture_edit`
- `collection_create` (transformations)
- `express_capture_create` (simplified flow)
- `materialization_create` / `materialization_edit`

Each has its own context, store hydration, and UI flow. However, they share a lot through common components where items are passed in.

### Search Params as State

URL search params synced with stores via:

- `useGlobalSearchParams()`: Reads global filters/pagination
- `useSearchParamAppend()`: Adds params without full navigation

Enables browser back/forward and shareable links.

### Provider Nesting Order (Important!)

Specific order required for dependencies:

to be documented later

### Binding Index Tracking

Bindings maintain multiple index mappings to cross-reference client/server state:

- `bindingIndex`: Position in client resource config array
- `builtBindingIndex`: Position in server-built spec
- `liveBindingIndex`: Position in live spec
- `validatedBindingIndex`: Position in validation response

This enables mapping errors from server back to client UI.

## GraphQL Migration (Q4 2025 Status)

Currently migrating from PostgREST to GraphQL for select features. See `GRAPHQL.md` for details.

**Current Approach**:

- Manual typing in `src/types/gql.ts` (no codegen yet)
- URQL client library (bare bones, easy to extend)
- Primary use: Alerts and live spec updates
- GraphiQL explorer: http://localhost:3000/test/gql

**Known Limitations**:

- Auth roles fetch via GQL has ~30s lag (blocks wider rollout)
- No graph caching yet (fetching more data than needed)

## Testing

See `TESTING.md` for detailed test scenarios (connector edge cases, create/edit workflows, binding variations).

### Unit Tests

- Framework: Vitest with jsdom
- Location: `src/**/__tests__/*.test.ts`
- Focus: Utils/helpers with simple input/output (time, table, dataPlane, workflow, entity, schema utils)
- Run single test file: `npm test -- src/utils/__tests__/time-utils.test.ts`

### E2E Tests

- Framework: Playwright
- Location: `playwright-tests/` (separate directory, intended to become standalone project)
- Tests entire application stack (not just UI)

## Build Configuration (Vite)

Key plugins in `vite.config.ts`:

- `checker()`: ESLint + TypeScript checks during dev
- `circleDependency()`: Prevents circular imports
- `compression()`: Gzip compression for production build
- `nodePolyfills()`: Polyfills for buffer, path, process, stream
- `sri()`: Subresource Integrity hash generation
- `viteTsconfigPaths()`: Path alias resolution from tsconfig
- `wasm()`: WebAssembly module support for @estuary/flow-web
- `writeVersionToFile()`: Custom plugin writing git commit hash to public/meta.json

**Target**: Uses browserslist config for ES target (see package.json)

## Common Gotchas

1. **Encrypted fields break discriminator matching**: Use custom logic in `src/forms/shared.ts` that matches by discriminator value alone
2. **GraphQL cache disabled for real-time types**: Alerts/LiveSpecRef return `null` for cache key to always fetch fresh for now
3. **Store active flag**: Set `store.setActive(false)` on unmount to prevent unnecessary hydration. Eventually this should be replaced by cleaning up / cancelling ongoing calls during unmount.
4. **LogRocket before Supabase**: LogRocket must initialize first to capture Supabase network requests
5. **Monaco workers**: Must be configured before React renders (done in `src/index.tsx`)
6. **Data plane token refresh**: Check `shouldRefreshToken()` on errors and re-authenticate before retry
7. **Trial collections**: Cannot be deleted, have special handling in `useTrialCollections()` hook
8. **Binding UUID tracking**: Use correct index mapping when cross-referencing errors between client/server state

## Ongoing Refactoring and Migrations

This list is a work in progress and not complete by any means.
Some of this is called out in the doc

1. Moving to strict state machines
2. Replacing PostgREST to GQL
3. Moving broken up Zustand states into a single one or two stores
4.
