import type { CatalogStats_Backlog } from 'src/types';

import { hasLength } from 'src/utils/misc-utils';

interface BindingReading {
    collectionName: string;
    bytesBehind: number;
}

export interface MaterializationBacklog {
    bindings: BindingReading[];
    bytesBehind: number;
    // The timestamp of the stats document the readings came from.
    ts: string;
}

// `bytesBehind` is a u64 in the stats protocol, and the default JSON encoding for
// those is a string so that values beyond 2^53 survive the trip. estuary/flow
// patches its Rust encoder to emit a number instead, but the encoding is not
// guaranteed to be uniform across producers, so accept either form.
//
// A binding with nothing left to read omits the field, so an absent reading is
// zero rather than unknown.
const toByteCount = (value: unknown): number => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
};

// The most recent stats row that actually describes the task's bindings.
//
// An hourly row is opened by whichever stats document lands first in that hour,
// and a usage heartbeat carries no `materialize` block at all — so the newest row
// for a task can exist while saying nothing about its bindings.
const newestBindingStats = (
    rows: CatalogStats_Backlog[]
): CatalogStats_Backlog | null =>
    [...rows]
        .sort((left, right) => Date.parse(right.ts) - Date.parse(left.ts))
        .find(({ flow_document }) =>
            hasLength(Object.keys(flow_document?.taskStats?.materialize ?? {}))
        ) ?? null;

// How far behind a materialization is, totalled across its bindings. Bindings
// that report no reading have caught up and contribute nothing, so a total of
// zero means the task is current.
//
// Returns null when no row describes the bindings at all.
export const parseMaterializationBacklog = (
    rows: CatalogStats_Backlog[]
): MaterializationBacklog | null => {
    const latest = newestBindingStats(rows);

    if (!latest) {
        return null;
    }

    const bindings = Object.entries(
        latest.flow_document?.taskStats?.materialize ?? {}
    )
        .map(([collectionName, bindingStats]) => ({
            collectionName,
            bytesBehind: toByteCount(bindingStats?.bytesBehind),
        }))
        .sort((left, right) => right.bytesBehind - left.bytesBehind);

    return {
        bindings,
        bytesBehind: bindings.reduce(
            (total, { bytesBehind }) => total + bytesBehind,
            0
        ),
        ts: latest.ts,
    };
};
