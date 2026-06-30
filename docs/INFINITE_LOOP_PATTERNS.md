# Infinite Loop Rendering Patterns

React will throw "Maximum update depth exceeded" when a `useSyncExternalStore` snapshot function returns a new reference on every call without the underlying data changing. Zustand uses `useSyncExternalStore` internally, so store selectors must produce stable return values.

## The Dangerous Pattern

`useShallow` from `zustand/react/shallow` caches the previous selector result and returns it when the new result is _shallowly equal_. Shallow equality compares collection elements/properties with `Object.is`.

The failure mode is a `.map()` inside a `useShallow` selector that creates new **object literals** as array elements:

```ts
// BROKEN — infinite loop
export const useBinding_fieldSelectionValidationContext = () =>
    useBindingStore(
        useShallow(
            (state) =>
                Object.entries(state.selections)
                    .filter(
                        ([_uuid, { status }]) =>
                            status === 'VALIDATION_REQUESTED'
                    )
                    .map(([uuid, { validationAttempts }]) => ({
                        uuid,
                        validationAttempts,
                    }))
            //                                        ^^^ new object literal every call
        )
    );
```

Why it loops:

1. Selector runs → produces `[{ uuid: 'a', validationAttempts: 1 }]`
2. `useShallow` checks: `Object.is({ uuid: 'a' }, { uuid: 'a' })` → `false` (different references)
3. Shallow compare fails → snapshot considered changed → component re-renders
4. Selector runs again → same result, same failure → infinite loop

## The Fix

Return **primitives** as array elements or object property values so `Object.is` can confirm equality:

```ts
// FIXED — returns Record<string, number>; useShallow compares primitive numbers
export const useBinding_fieldSelectionValidationContext = (): Record<
    string,
    number
> =>
    useBindingStore(
        useShallow((state) =>
            Object.fromEntries(
                Object.entries(state.selections)
                    .filter(
                        ([_uuid, { status }]) =>
                            status === 'VALIDATION_REQUESTED'
                    )
                    .map(([uuid, { validationAttempts }]) => [
                        uuid,
                        validationAttempts,
                    ])
                //                                            ^^^ number primitive — stable
            )
        )
    );
```

## What `useShallow` Can Stabilize

| Return shape                                           | Element type           | Safe?                             |
| ------------------------------------------------------ | ---------------------- | --------------------------------- |
| `string[]`                                             | primitive              | Yes                               |
| `number[]`                                             | primitive              | Yes                               |
| `boolean[]`                                            | primitive              | Yes                               |
| `Record<string, string \| number \| boolean>`          | primitives             | Yes                               |
| `{ key: storeStateRef }`                               | store object reference | Yes — same ref if store unchanged |
| `SomeObject[]` where items are `.map(() => ({ ... }))` | new object literals    | **No — infinite loop**            |

## Safe Patterns in This Codebase

These all pass `useShallow` comparisons correctly:

- `useBinding_backfilledCollections` — `.map()` returns `collectionName` strings
- `useBinding_collectionsBeingBackfilled` — same, collection name strings
- `useBinding_sourceCaptureFlags` — object with boolean values
- `useEntitiesStore_tenantsWithAdmin` — `Array.from(Set<string>)`, string elements
- `useSourceCaptureStore_sourceCaptureDefinition` — builds a new object but property values are store state references; `useShallow` compares those references, which are stable when the store hasn't changed
