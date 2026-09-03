export type BindingStatus = 'enabled' | 'disabled';

// Status is deliberately absent: with only Enabled and Disabled to order by, a
// sort would duplicate the filter chips above the table, which do the same job
// and also report their counts.
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
    // null if it moved nothing in it. Windowed like every other figure in the
    // table — a binding with no data in the range has no last-data time in it
    // either, which is why the cell reads as blank rather than "never".
    lastPublishedAt: string | null;
    // How far behind this binding is, in bytes and in source-publication time.
    //
    // Unlike every other figure on the row these are *not* windowed: they are
    // gauges read from the task's newest hourly stats row, so they describe
    // where the binding stands now regardless of the range the chart is on.
    // The column tooltips say so, because a table whose other columns all
    // answer "in the selected range" would otherwise imply it of these too.
    //
    // Null means no reading, which is the case for every capture (there is no
    // upstream frontier to be behind) and for a materialization binding absent
    // from the latest reading. Zero means caught up, and is a real answer: a
    // binding with nothing left to read omits `bytesBehind` entirely, which
    // `parseMaterializationBacklog` already resolves to 0.
    bytesBehind: number | null;
    secondsBehind: number | null;
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
