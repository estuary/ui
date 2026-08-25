# State Management

## Overview

State lives in four places:

1. **React Context** — top-level app concerns (auth, routing, theme, notifications)
2. **Zustand Stores** — client editing/UI state (forms, bindings, workflow progression)
3. **URQL graphcache** — server data fetched over GraphQL; the target home for all server data (`docs/GRAPHQL.md`)
4. **SWR** — REST fetching (entity status, shards, journal data, gateway auth). Data-plane reads come from the Data-Plane-Gateway and are not in GraphQL, so this path stays for them. New control-plane data goes to GraphQL.

Many Zustand stores still mirror server data through hydration slices. Narrow them as you touch them (see In-Flight Migrations in `CLAUDE.md`).

---

## Zustand Stores

### Store Composition via Slices

`getStoreWithHydrationSettings()` (`src/stores/extensions/Hydration.ts`) is the one shared slice factory: ten stores compose it in for the legacy hydration path described below.

Large stores also split their own state into single-consumer slice files (e.g. `src/stores/Binding/slices/` — field selection, backfill, toggle-disable, time travel). These organize one store's files and enable unit tests per slice:

```typescript
getInitialState = (set) => ({
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithFieldSelectionSettings(set),
    ...getStoreWithTimeTravelSettings(set),
    // ... domain-specific logic
});
```

Write a slice as a shared factory only when a second store consumes it.

### Consuming Stores in Components

Select one value per store hook call:

```typescript
const active = useBillingStore((state) => state.active);
const setActive = useBillingStore((state) => state.setActive);
```

A single-value selector returns a stable reference, so it needs no equality helper. Zustand setters are stable, so selecting one never causes a re-render.

Multi-field and derived selections live in named hooks in the store's `hooks.ts` (e.g., `useBinding_sourceCaptureFlags`). This keeps `useShallow` and its pitfalls (see `docs/INFINITE_LOOP_PATTERNS.md`) in one vetted place per store, and store refactors touch one file. Derive shapes with `useMemo` or at write time; do not build new objects inside a selector.

Many components still select tuples inline:

```typescript
const [active, setActive] = useBillingStore(
    useShallow((state) => [state.active, state.setActive])
);
```

Migrate these as you touch them.

### Local Zustand (Scoped Stores)

`src/context/LocalZustand.tsx` and `src/context/Zustand/provider.tsx` provide per-subtree Zustand stores via React context. Use this for state that is scoped to a feature subtree and does not need to be global.

---

## Store Hydration (legacy)

Several stores fetch their own server data through the `StoreWithHydration` slice (`src/stores/extensions/Hydration.ts`). Do not extend this pattern: new control-plane data comes over GraphQL and stays in the URQL cache; data-plane reads go through SWR against the Data-Plane-Gateway. Hydration slices shrink away as their data moves to the URQL cache.

When a component consumes a hydrated store, call `setActive(true)` on mount and `setActive(false)` on unmount. Hydration setters silently discard writes while `active` is false — the gate stops a late fetch response from writing stale data into the global store.

### React 18 StrictMode

Our application's approach to hydration does NOT work with React 18 StrictMode's double-invoke behavior. We are still working out how we want to handle this. See `docs/REACT.md` for the full list of affected files and the planned fix.

---

## Workflow State Machine

### Legacy approach

Older forms use an explicit `FormStatus` enum (`INIT`, `SAVING`, `SAVED`, `TESTING`, `TESTED`, `FAILED`, etc.). The order of steps can be freely changed in most cases, with a few exceptions (e.g., `setFormState`). The main failure mode was adding new steps and ensuring correct ordering.

### Current approach

Newer flows use a stricter custom state machine where step order is closely controlled. This direction is under review as of June 2026 — confirm it still holds before you extend the strict state-machine pattern to new flows or adopt a library for it.

UI responds to status changes for spinners, error messages, and CTAs.

---

## Multi-Workflow Support

Different entity creation/edit flows exist as separate contexts and store hydration chains:

- `capture_create` / `capture_edit`
- `collection_create` (transformations)
- `materialization_create` / `materialization_edit`

Each flow has its own context, store hydration, and UI progression. Common UI is shared through components that accept configuration as props.
