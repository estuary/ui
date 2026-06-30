# Error Handling

## Layers

Errors are handled at four levels:

1. **React error boundaries** — uncaught render errors
2. **Store hydration errors** — API failures during store initialization
3. **Form validation errors** — AJV + JSONForms validation
4. **API call errors** — PostgREST/Supabase response errors

---

## React Error Boundaries

**`src/components/shared/ErrorBoundryWrapper.tsx`** (note the typo in the filename — it's intentional/historic)

Uses `react-error-boundary`. On error it renders an expandable `AlertBox` with the stack trace and calls `logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED)`. A top-level boundary wraps the entire app in `src/context/index.tsx`; additional boundaries are placed around individual lazy-loaded routes.

This component is missing the feature to allow user to reload just the section that failed.

---

## API Errors

**`src/services/supabase.ts`**

All Supabase API calls are wrapped through `handleSuccess` / `handleFailure` helpers that normalize responses:

```typescript
interface CallSupabaseResponse<T> {
    data: T | null;
    error?: PostgrestError;
}

// Usage in src/api/ layer:
const result = await supabaseRetry(() => query, 'operationName').then(
    handleSuccess<MyType>,
    handleFailure
);

if (result.error) {
    // handle error
}
```

`BASE_ERROR` (also from `src/services/supabase`) is the empty `PostgrestError` shape used as a template when constructing errors manually:

```typescript
export const BASE_ERROR: PostgrestError = {
    code: '',
    details: '',
    hint: '',
    message: '',
    name: '',
};
```

This allows us to more easily share an error rendering component. This is mainly historical but still followed for ease of development.

---

## Store Hydration Errors

**`src/stores/extensions/Hydration.ts`**

Stores that implement `StoreWithHydration` track error state:

```typescript
hydrationError: string | null; // Error message, null if none
hydrationErrorsExist: boolean; // True if any binding/sub-store errored
networkFailed: boolean; // True if error matches FAILED_TO_FETCH
hydrationWarning: ProtocolStatus | null;
```

`setHydrationError(value)` only stores the error if `state.active` is `true` — errors from inactive stores are silently dropped.

**How errors surface to UI:**

Hydrator components (e.g., `src/stores/Workflow/Hydrator.tsx`) read `hydrationError` and render `<Error condensed error={{ ...BASE_ERROR, message: hydrationError }} />` when it is set.

See `docs/STATE.md` for more details about `Store Hydaration`

---

## Form Validation Errors

**`src/services/ajv.ts`**

AJV is configured with `strict: 'log'` (warnings, not failures) and `useDefaults: 'empty'` (mutates input to apply schema defaults). Custom Flow annotations are registered as keywords so AJV does not reject them.

`createJSONFormDefaults(schema, collection?, dataDefaults?)` returns:

```typescript
{ data: object, errors: AjvError[] }
```

Validation errors from AJV are passed through JSONForms renderers and collected into the `EndpointConfigStore` and `BindingStore`.

**`src/components/shared/Entity/ValidationErrorSummary/index.tsx`** aggregates errors from all relevant stores and renders them in a collapsible `AlertBox` at the top of the form.

---

## Error Display Components

### `<Error>` — `src/components/shared/Error/index.tsx`

General-purpose error display. Renders an `AlertBox` with a title and message.

```typescript
<Error
    condensed          // Smaller layout
    error={myError}    // PostgrestError | any | null
    severity="error"   // AlertColor, defaults to "error"
    hideTitle          // Hides the title on the AlertBox
    hideIcon           // Hides the large icon on the side of the AlertBox
    cta={<Button>Retry</Button>}
/>
```

Returns `null` if `error` is falsy.

### `<HydrationError>` — `src/components/shared/HydrationError.tsx`

Specialized wrapper for store hydration failures. Shows a standard "failed to initialize" message with a support link.

### `<AlertBox>` — `src/components/shared/AlertBox.tsx`

The base alert component used by both of the above. Wraps MUI `Alert` with project styling. All error UI ultimately renders through `AlertBox`.

---

## Error Message Resolution

**`src/components/shared/Error/Message.tsx`**

Determines whether to show a raw system error message or an i18n-translated one:

- If the error is a `PostgrestError` (has a `code` property) or a GraphQL error (has `networkError`) → show `error.message` directly
- Otherwise → treat `error.message` as an i18n message ID and call `intl.formatMessage({ id })`

Every time an error message is displayed, `logRocketEvent(CustomEvents.ERROR_DISPLAYED)` is called so support can correlate session recordings with errors.

---

## Error Flow Summary

```
API call (src/api/)
  → handleSuccess / handleFailure
    → CallSupabaseResponse<T>
      → store.setHydrationError(message)    if hydration path
      → store.setError(message)             if form state path
        → <ValidationErrorSummary>          aggregates across stores
        → <HydrationError> / <Error>        renders AlertBox
          → Error/Message.tsx               resolves i18n vs raw message
            → logRocketEvent(ERROR_DISPLAYED)
```
