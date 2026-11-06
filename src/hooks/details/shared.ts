import type { CatalogTaskStats } from 'src/api/catalogStats';

import { hasLength } from 'src/utils/misc-utils';

interface BindingReading {
    collectionName: string;
    bytesBehind: number;
    lastSourcePublishedAt?: string;
}

export interface MaterializationBacklog {
    bindings: BindingReading[];
    bytesBehind: number;
    // When the stats interval the readings came from starts, in Unix seconds.
    timestamp: number;
}

interface BindingTimeLag {
    collectionName: string;
    seconds: number;
}

export interface MaterializationTimeLag {
    bindings: BindingTimeLag[];
    seconds: number;
}

// The most recent stats row that actually describes the task's bindings.
//
// An hourly row is opened by whichever stats document lands first in that hour,
// and a usage heartbeat carries no `materialize` block at all — so the newest row
// for a task can exist while saying nothing about its bindings.
const newestBindingStats = (
    rows: CatalogTaskStats[]
): CatalogTaskStats | null =>
    [...rows]
        .sort((left, right) => right.timestamp - left.timestamp)
        .find(({ taskStats }) => hasLength(taskStats?.materialize ?? [])) ??
    null;

// How far behind a materialization is, totalled across its bindings. Bindings
// that report no reading have caught up and contribute nothing, so a total of
// zero means the task is current.
//
// Returns null when no row describes the bindings at all.
export const parseMaterializationBacklog = (
    rows: CatalogTaskStats[]
): MaterializationBacklog | null => {
    const latest = newestBindingStats(rows);

    if (!latest) {
        return null;
    }

    const bindings = (latest.taskStats?.materialize ?? [])
        .map((bindingStats) => ({
            collectionName: bindingStats.collection,
            bytesBehind: Number(bindingStats.bytesBehind),
            lastSourcePublishedAt:
                bindingStats.lastSourcePublishedAt ?? undefined,
        }))
        .sort((left, right) => right.bytesBehind - left.bytesBehind);

    return {
        bindings,
        bytesBehind: bindings.reduce(
            (total, { bytesBehind }) => total + bytesBehind,
            0
        ),
        timestamp: latest.timestamp,
    };
};

// The latest publication timestamp per collection across a set of stats rows.
// `lastPublishedAt` reduces by maximizing within a row's grain, but a collection
// spans several rows, and the newest row does not necessarily carry the field —
// a row written because a materialization read the collection records no
// publication of its own.
export const latestPublishedByCollection = (
    rows: CatalogTaskStats[]
): Record<string, string> =>
    rows.reduce<Record<string, string>>((latest, row) => {
        const { lastPublishedAt } = row;

        if (!lastPublishedAt) {
            return latest;
        }

        const known = latest[row.catalogName];

        return !known || Date.parse(lastPublishedAt) > Date.parse(known)
            ? { ...latest, [row.catalogName]: lastPublishedAt }
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
