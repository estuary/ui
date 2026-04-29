# State Management

## Overview

Three layers of state:

1. **React Context** — top-level app concerns (auth, routing, theme, notifications)
2. **Zustand Stores** — complex domain state (user, entities, forms, bindings, workflows)
3. **SWR** — REST data fetching with caching/revalidation
4. **GQL** — Moving towards using GQL and just accessing data directly

---

## Zustand Stores

### Store Composition via Slices

Stores are assembled from reusable slice factories:

- `getStoreWithHydrationSettings()` — async data loading from APIs
- `getStoreWithFieldSelectionSettings()` — field picker state
- `getStoreWithBackfillSettings()` — backfill configuration
- `getStoreWithToggleDisableSettings()` — enable/disable toggles
- `getStoreWithTimeTravelSettings()` — time travel / historical data settings

Example from `BindingStore`:

```typescript
getInitialState = (set) => ({
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithFieldSelectionSettings(set),
    ...getStoreWithTimeTravelSettings(set),
    // ... domain-specific logic
});
```

State mutations use Immer's `produce()` when updating multiple or deeply nested values. However, we are looking at moving away from using Immer specifically due to some performance issues.

### Consuming Stores in Components

As of Q1 2026 - We are moving back to having pre-made hooks. This way we can more easily make mass changes during migrations/refactoring/etc.

We currently have a lot of direct selector access with `useShallow`:

```typescript
const [active, setActive] = useBillingStore(
    useShallow((state) => [state.active, state.setActive])
);
```

Pre-made named hooks (e.g., `useBinding_sourceCaptureFlags`) are used for complex derived state to keep selector logic out of components.

### Local Zustand (Scoped Stores)

`src/context/LocalZustand.tsx` and `src/context/Zustand/provider.tsx` provide per-subtree Zustand stores via React context. Use this for state that is scoped to a feature subtree and does not need to be global.

---

## Store Hydration

### Without GraphQL

Stores implement `StoreWithHydration`:

```typescript
interface StoreWithHydration {
    hydrated: boolean;
    hydrateState: () => Promise<void> | void;
    hydrationError: string | null;
    active: boolean; // Set to false to prevent hydration
}
```

Components call `store.hydrateState()` on mount. Set `store.setActive(false)` on unmount to prevent unnecessary hydration. Eventually this should be replaced by cancelling in-flight calls on unmount.

### With GraphQL

Data is not loaded into a store when using GraphQL — it stays in the URQL cache. This allows graph caching to work correctly. See `docs/GRAPHQL.md` for details.

### React 18 StrictMode

Our application's approach to hydration does NOT work with React 18 StrictMode's double-invoke behavior. We are still working out how we want to handle this. See `docs/REACT.md` for the full list of affected files and the planned fix.

---

## Workflow State Machine

### Legacy approach

Older forms use an explicit `FormStatus` enum (`INIT`, `SAVING`, `SAVED`, `TESTING`, `TESTED`, `FAILED`, etc.). The order of steps can be freely changed in most cases, with a few exceptions (e.g., `setFormState`). The main failure mode was adding new steps and ensuring correct ordering.

### Current approach

Newer flows use a stricter custom state machine where step order is closely controlled. XState or a similar library is under consideration for future use.

UI responds to status changes for spinners, error messages, and CTAs.

---

## Multi-Workflow Support

Different entity creation/edit flows exist as separate contexts and store hydration chains:

- `capture_create` / `capture_edit`
- `collection_create` (transformations)
- `express_capture_create` (simplified flow)
- `materialization_create` / `materialization_edit`

Each flow has its own context, store hydration, and UI progression. Common UI is shared through components that accept configuration as props.

---

## Search Params as State

URL search params are synced with stores via:

- `useGlobalSearchParams()` — reads global filters and pagination
- `useSearchParamAppend()` — adds params without triggering a full navigation

This enables browser back/forward navigation and shareable links.

---

## Binding Index Tracking

Bindings maintain multiple index mappings to cross-reference client and server state:

- `bindingIndex` — position in the client resource config array
- `builtBindingIndex` — position in the server-built spec
- `liveBindingIndex` — position in the live spec
- `validatedBindingIndex` — position in the validation response

Use the correct index when cross-referencing errors from the server back to the client UI.
