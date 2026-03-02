# React

## Version

Currently on **React 18**.

## React 17 → 18 Migration Notes

### What was migrated

- **`createRoot`** — `src/index.tsx` uses `createRoot` from `react-dom/client`. The old `ReactDOM.render` is gone.
- **`react-is` override** — Pinned to `^18.3.1` in `package.json` `overrides`. MUI v7 internally pulls `react-is@^19`, which changed how React elements are identified. Using v19 of `react-is` with React 18 causes runtime errors in prop-type checks. The override prevents this. **When upgrading to React 19, remove this override.**
- **Automatic batching** — React 18 batches all state updates by default (not just those inside React event handlers). No `unstable_batchedUpdates` calls exist in the codebase.
- **Types** — `@types/react@^18` and `@types/react-dom@^18` are installed. No `React.FC` annotations exist (that type dropped implicit `children` in v18 types).
- **Testing** — `@testing-library/react@^16` is installed, which exceeds the v13 minimum required for React 18.

### Known open items

#### StrictMode is disabled

`StrictMode` is commented out in `src/index.tsx`. React 18 StrictMode double-invokes effects in development to help surface side effects, but this breaks the `useEffectOnce` hydration pattern used across several stores and components.

Affected files using `useEffectOnce`:

- `src/stores/Workflow/Hydrator.tsx`
- `src/stores/DetailsForm/Hydrator.tsx`
- `src/components/shared/Entity/Error/index.tsx`
- `src/components/tables/EntityTable/useTableUtils.ts`
- `src/components/tables/EntityTable/index.tsx`
- `src/hooks/login/useLoginStateHandler.ts`

The fix is to replace `useEffectOnce` with `useEffect` and a ref guard (or restructure hydration) so effects are idempotent and safe to run twice. This is tracked with a TODO comment in `src/stores/Workflow/Hydrator.tsx`.

Until this is resolved, StrictMode should remain disabled in development.

---

## React Patterns in Use

### Context API

19 contexts defined across `src/context/` and a few component-local contexts:

- `src/context/` — top-level app concerns: theme, routing, auth, notifications, workflow, confirmation dialogs
- `src/context/Zustand/` — local Zustand store injection (see Zustand section below)
- Component-local contexts: `src/components/logs/Context.tsx`, `src/components/shared/WizardDialog/context.tsx`, etc.

All contexts are initialized to `null` and narrowed with a custom hook that throws if used outside a provider. No bare `useContext` calls exist in components.

### Code Splitting (Suspense + lazy)

All route-level code splitting is centralized in `src/context/Router/index.tsx`. Every lazy route is wrapped in `<Suspense fallback={null}>`. No ad-hoc `lazy()` calls exist outside the router.

### Error Boundaries

`src/components/shared/ErrorBoundryWrapper.tsx` wraps `react-error-boundary`'s `<ErrorBoundary>`. On error it renders an expandable `AlertBox` and calls `logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED)`. No legacy class-based `componentDidCatch` exists anywhere.

### Fragments

The codebase predominantly uses the `<>` shorthand. `<React.Fragment key={...}>` is used only where a `key` prop is required (keyed fragments in lists).

### forwardRef

8 files use `forwardRef` — all valid in React 18:

- `src/icons/CheckSquare.tsx`
- `src/icons/EditOff.tsx`
- `src/components/shared/AlertBox.tsx`
- `src/components/shared/AutoComplete/VirtualizedList/index.tsx`
- `src/components/shared/AutoComplete/VirtualizedList/OuterElement.tsx`
- `src/components/shared/pickers/DateTimePickerCTA.tsx`
- `src/components/shared/pickers/TimePickerCTA.tsx`
- `src/components/navigation/RouterLink.tsx`

**React 19 note:** `forwardRef` is deprecated in React 19 in favor of passing `ref` as a plain prop. These will need updating when upgrading.

### Refs (useRef)

`useRef` is used in two ways throughout the codebase:

- **DOM refs** — passed to elements (`ref={inputRef}`, Monaco editor containers, etc.)
- **Instance variables** — mutable values that should not trigger re-renders (abort controllers, resolved promise refs in confirmation dialogs, initialization flags)

No deprecated `React.createRef()` calls exist anywhere.

### Memoization (memo, useMemo, useCallback)

`useMemo` and `useCallback` are used widely without a documented strategy. `React.memo` is used in only 3 places, all in the JSON Forms renderer layer:

- `src/forms/overrides/material/controls/MuiInputText.tsx`
- `src/forms/renderers/MaterialEnumControl/index.tsx`
- `src/services/jsonforms/JsonFormsContext.tsx`

The rest of the component tree does not use `React.memo`. `useMemo`/`useCallback` appear to be used primarily to stabilize references for dependency arrays rather than as a deliberate optimization strategy.

### Class Components

One class component exists: `src/forms/overrides/material/complex/CombinatorProperties.tsx`. This is a vendored MIT-licensed component from the JSONForms project that was modified locally. It is not project-authored and should not be converted without careful testing of the form rendering pipeline. All other components are function components.

### Zustand Stores

See `CLAUDE.md` for the full Zustand architecture. Key React-specific patterns:

- **Direct selector access** — components access store state via `useShallow` selectors:
    ```typescript
    const [active, setActive] = useBillingStore(
        useShallow((state) => [state.active, state.setActive])
    );
    ```
- **Pre-made hooks** — complex derived state still uses named hooks (e.g., `useBinding_sourceCaptureFlags`) to keep selector logic out of components.
- **Local Zustand** — `src/context/LocalZustand.tsx` and `src/context/Zustand/provider.tsx` provide per-subtree Zustand stores via React context, used for scoped state that does not need to be global.

---

## Known Issues and Anti-patterns

### Excessive prop drilling — EntityTable

`src/components/tables/EntityTable/index.tsx` accepts 27 props. This is the clearest prop-drilling anti-pattern in the codebase. Splitting the component or introducing a context for table configuration would reduce the surface area.

### No React.memo strategy

There is no documented rule for when to wrap a component in `React.memo`. Almost nothing is memoized at the component level. For performance-sensitive subtrees (large tables, frequent re-renders from store selectors), this may be worth revisiting with profiling data before applying broadly.

---

## React 19 Upgrade Checklist

When upgrading to React 19:

- [ ] Remove the `"react-is": "^18.3.1"` override in `package.json`
- [ ] Re-enable `<StrictMode>` in `src/index.tsx` (requires resolving `useEffectOnce` usages first — see above)
- [ ] Replace all 8 `forwardRef` usages with plain `ref` props
- [ ] Update `@types/react` and `@types/react-dom` to `^19`
- [ ] Review `react-error-boundary` version compatibility
- [ ] Review `@testing-library/react` version requirements
