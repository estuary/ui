export type BindingStatus = 'enabled' | 'disabled';

// Status is absent: the filter chips above the table already order by it.
export type BindingSortKey =
    | 'bytes'
    | 'bytesBehind'
    | 'collection'
    | 'docs'
    | 'lastPublishedAt'
    | 'resourcePath'
    | 'secondsBehind';

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
    // null if it moved nothing in it — windowed like every other figure here.
    lastPublishedAt: string | null;
    // How far behind this binding is, in bytes and in source-publication time.
    //
    // Unlike every other figure on the row these are *not* windowed: they are
    // gauges read from the task's newest hourly stats row, so they describe
    // where the binding stands now regardless of the selected range.
    //
    // Null means no reading — every capture (no upstream frontier to be behind)
    // and any materialization binding absent from the latest one. Zero means
    // caught up, and is a real answer: a binding with nothing left to read omits
    // `bytesBehind`, which `parseMaterializationBacklog` resolves to 0.
    bytesBehind: number | null;
    secondsBehind: number | null;
}

// A binding's figures over the selected window. Mutable because
// `accumulateBindingStats` accumulates in place over what can be 48 intervals ×
// every binding on the task.
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
