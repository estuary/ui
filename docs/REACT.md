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
