export type BindingStatus = 'enabled' | 'disabled';

// Status is deliberately absent: with only Enabled and Disabled to order by, a
// sort would duplicate the filter chips above the table, which do the same job
// and also report their counts.
export type BindingSortKey =
    | 'bytes'
    | 'collection'
    | 'docs'
    | 'lastPublishedAt'
    | 'resourcePath';

export interface BindingRow {
    // Full collection name. Unique per row in practice, but a spec may bind the
    // same collection twice, so the row key also folds in the binding index.
    collection: string;
    index: number;
    // Human-readable endpoint resource, e.g. `public.orders`. Captures only:
    // for a materialization the binding *is* the collection.
    resourcePath: string;
    status: BindingStatus;
    docs: number;
    bytes: number;
    // Newest document this binding accounts for within the selected range, or
    // null if it moved nothing in it. Windowed like every other figure in the
    // table — a binding with no data in the range has no last-data time in it
    // either, which is why the cell reads as blank rather than "never".
    lastPublishedAt: string | null;
}

// A binding's figures over the selected window, accumulated across the
// intervals that make it up. Mutable because `accumulateBindingStats`
// accumulates in place over what can be 48 intervals × every binding on the
// task.
export interface BindingVolume {
    bytes: number;
    docs: number;
    lastPublishedAt: string | null;
}

export interface BindingCounts {
    all: number;
    enabled: number;
    disabled: number;
}

export interface BindingsFilterState {
    query: string;
    status: BindingStatus | 'all';
}
