import type {
    CatalogStats_Backlog,
    CatalogStats_LastPublished,
} from 'src/types';

import { hasLength } from 'src/utils/misc-utils';

interface BindingReading {
    collectionName: string;
    bytesBehind: number;
    lastSourcePublishedAt?: string;
}

export interface MaterializationBacklog {
    bindings: BindingReading[];
    bytesBehind: number;
    // The timestamp of the stats document the readings came from.
    ts: string;
}

interface BindingTimeLag {
    collectionName: string;
    seconds: number;
}

export interface MaterializationTimeLag {
    bindings: BindingTimeLag[];
    seconds: number;
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
            lastSourcePublishedAt: bindingStats?.lastSourcePublishedAt,
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

// The latest publication timestamp per collection across a set of stats rows.
// `lastPublishedAt` reduces by maximizing within a row's grain, but a collection
// spans several rows, and the newest row does not necessarily carry the field —
// a row written because a materialization read the collection records no
// publication of its own.
export const latestPublishedByCollection = (
    rows: CatalogStats_LastPublished[]
): Record<string, string> =>
    rows.reduce<Record<string, string>>((latest, row) => {
        const lastPublishedAt =
            row.flow_document?.statsSummary?.lastPublishedAt;

        if (!lastPublishedAt) {
            return latest;
        }

        const known = latest[row.catalog_name];

        return !known || Date.parse(lastPublishedAt) > Date.parse(known)
            ? { ...latest, [row.catalog_name]: lastPublishedAt }
            : latest;
    }, {});

// How far behind a materialization is in source-publication time: the gap
// between the newest document published to a source collection and the newest
// one the binding has processed. A task is only as caught up as its worst
// binding, so the task-level figure is the maximum rather than a sum.
//
// Returns null when no binding has both timestamps, which is the case for a
// runtime that reports neither and for a collection nothing has published to.
export const computeMaterializationTimeLag = (
    bindings: Array<
        Pick<BindingReading, 'collectionName' | 'lastSourcePublishedAt'>
    >,
    lastPublishedByCollection: Record<string, string>
): MaterializationTimeLag | null => {
    const lags = bindings.flatMap(
        ({ collectionName, lastSourcePublishedAt }) => {
            const lastPublishedAt = lastPublishedByCollection[collectionName];

            if (!lastSourcePublishedAt || !lastPublishedAt) {
                return [];
            }

            const seconds =
                (Date.parse(lastPublishedAt) -
                    Date.parse(lastSourcePublishedAt)) /
                1000;

            if (!Number.isFinite(seconds)) {
                return [];
            }

            // A binding can sit at or past its collection's recorded frontier,
            // since the two timestamps come from rows written by different tasks
            // at different moments. Anything at or beyond it has read everything
            // the collection currently holds.
            return [{ collectionName, seconds: Math.max(seconds, 0) }];
        }
    );

    if (!hasLength(lags)) {
        return null;
    }

    return {
        bindings: lags.sort((left, right) => right.seconds - left.seconds),
        seconds: lags[0].seconds,
    };
};
