import type {
    BindingCounts,
    BindingRow,
    BindingsFilterState,
    BindingSortKey,
    BindingVolume,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type {
    MaterializationBacklog,
    MaterializationTimeLag,
} from 'src/hooks/details/shared';
import type { LiveSpecBinding } from 'src/hooks/useLiveSpecs';
import type {
    CaptureBindingStats,
    Entity,
    MaterializeBindingStats,
    SortDirection,
    TaskStats,
} from 'src/types';

import { getCollectionName } from 'src/utils/workflow-utils';

export const BINDINGS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_BINDINGS_PER_PAGE = 10;

// Splits on the space `formatBytes` (via `prettyBytes`) always emits between
// the number and its unit, so the digits can be right-aligned independently of
// the unit's width.
export const splitFormattedBytes = (formatted: string): [string, string] => {
    const spaceIndex = formatted.indexOf(' ');
    return spaceIndex === -1
        ? [formatted, '']
        : [formatted.slice(0, spaceIndex), formatted.slice(spaceIndex + 1)];
};

// A capture's rows carry a source stream as well as a collection, so its search
// covers both.
export const getSearchLabel = (entityType: Entity): string =>
    entityType === 'materialization'
        ? 'Filter by collection'
        : 'Filter by source stream or collection';

// Fallback keys, for a spec whose resource predates `_meta.path`. Endpoint
// resource configs are connector-specific, so there is no single field holding
// the stream name; connectors annotate the relevant property with
// `x-collection-name`, but that annotation lives on the connector tag's resource
// schema, which the details query does not fetch.
const RESOURCE_NAME_KEYS = [
    'stream',
    'table',
    'collection',
    'name',
    'topic',
    'object',
    'index',
    'path',
];

// Deliberately excludes `prefix`, which is not reliably a namespace:
// source-hello-world uses it for a greeting template, so treating it as one
// rendered a binding as "Hello {}!.greetings".
const RESOURCE_NAMESPACE_KEYS = ['schema', 'namespace', 'database'];

const asDisplayValue = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    // Resources are often expressed as a path array, joined with a dot because
    // these read as qualified names ("public.orders") rather than file paths.
    if (Array.isArray(value)) {
        const segments = value.filter(
            (segment): segment is string =>
                typeof segment === 'string' && segment.length > 0
        );

        return segments.length > 0 ? segments.join('.') : undefined;
    }

    return undefined;
};

const firstDisplayValue = (
    resource: Record<string, any>,
    keys: string[]
): string | undefined => {
    for (const key of keys) {
        const value = asDisplayValue(resource[key]);

        if (value !== undefined) {
            return value;
        }
    }

    return undefined;
};

/**
 * The endpoint resource a binding reads from or writes to, as a display string.
 *
 * `resource._meta.path` is authoritative where it exists: it is the resource
 * path the connector declared at discovery, present on every binding a recent
 * agent wrote, and `getBindingIndexByResourcePath` already treats it as the
 * identity of a binding. Guessing from field names is only a fallback for older
 * specs.
 */
const getResourcePath = (
    resource: Record<string, any> | undefined,
    collection: string
): string => {
    const fallback = collection.split('/').at(-1) ?? collection;

    if (!resource || typeof resource !== 'object') {
        return fallback;
    }

    const declaredPath = asDisplayValue(resource._meta?.path);

    if (declaredPath) {
        return Array.isArray(resource._meta.path)
            ? resource._meta.path.filter(Boolean).join('.')
            : declaredPath;
    }

    const name = firstDisplayValue(resource, RESOURCE_NAME_KEYS);

    if (!name) {
        return fallback;
    }

    const namespace = firstDisplayValue(resource, RESOURCE_NAMESPACE_KEYS);

    return namespace ? `${namespace}.${name}` : name;
};

/**
 * Per-binding volume, read from the field the task's own total is accumulated
 * from: `out` for a capture, `right` for a materialization.
 *
 * Getting this wrong is quiet rather than loud — `taskStats.materialize[c].out`
 * exists and is summed, but counts documents *out of the combiner* after
 * reduction, so a column built on it would not add up to the "data read" figure
 * the usage graph reports beside it.
 *   https://github.com/estuary/flow/blob/master/ops-catalog/catalog-stats.ts
 */
const readVolume = (
    stats: CaptureBindingStats | MaterializeBindingStats | undefined,
    entityType: Entity
) => {
    const volume =
        entityType === 'materialization'
            ? (stats as MaterializeBindingStats | undefined)?.right
            : (stats as CaptureBindingStats | undefined)?.out;

    return {
        docs: volume?.docsTotal ?? 0,
        bytes: volume?.bytesTotal ?? 0,
    };
};

/**
 * Per-binding freshness, from whichever field the entity records it in: a
 * capture stamps the document it published, a materialization stamps the
 * *source* document it processed.
 */
const readLastPublishedAt = (
    stats: CaptureBindingStats | MaterializeBindingStats | undefined,
    entityType: Entity
): string | null =>
    (entityType === 'materialization'
        ? (stats as MaterializeBindingStats | undefined)?.lastSourcePublishedAt
        : (stats as CaptureBindingStats | undefined)?.lastPublishedAt) ?? null;

/**
 * Per-collection figures over a window, accumulated across its intervals.
 *
 * `catalog_stats` holds one row per interval of a grain, each carrying its own
 * full per-binding breakdown, so the window total is the sum over rows — the
 * same accumulation the chart above the table performs, which is what keeps the
 * two agreeing. A collection absent from an interval contributed nothing to it
 * and must not zero out the intervals where it did appear.
 *
 * The timestamp takes the maximum of the intervals *that moved data*. Within one
 * interval the field is last-write-wins, so the newest is what the window asks
 * about; but an interval can carry a timestamp while the binding moved nothing,
 * and reporting that would put a time beside a zero.
 */
const accumulateBindingStats = (
    taskStatsByInterval: TaskStats[] | null | undefined,
    entityType: Entity
): Map<string, BindingVolume> => {
    const totals = new Map<string, BindingVolume>();

    if (!taskStatsByInterval) {
        return totals;
    }

    for (const interval of taskStatsByInterval) {
        const byCollection =
            entityType === 'materialization'
                ? interval.materialize
                : interval.capture;

        if (!byCollection) {
            continue;
        }

        for (const [collection, stats] of Object.entries(byCollection)) {
            const { bytes, docs } = readVolume(stats, entityType);

            const lastPublishedAt =
                docs > 0 || bytes > 0
                    ? readLastPublishedAt(stats, entityType)
                    : null;

            const running = totals.get(collection);

            if (running) {
                running.bytes += bytes;
                running.docs += docs;

                if (
                    lastPublishedAt &&
                    (!running.lastPublishedAt ||
                        lastPublishedAt > running.lastPublishedAt)
                ) {
                    running.lastPublishedAt = lastPublishedAt;
                }
            } else {
                totals.set(collection, { bytes, docs, lastPublishedAt });
            }
        }
    }

    return totals;
};

/**
 * Joins a task's spec bindings with its per-binding stats for the window.
 *
 * The spec is the source of truth rather than `writes_to`/`reads_from`, which
 * hold only *enabled* targets — a capture with 835 of its 870 bindings disabled
 * surfaces none of them otherwise.
 */
export const buildBindingRows = (
    specBindings: LiveSpecBinding[] | undefined,
    taskStatsByInterval: TaskStats[] | null | undefined,
    entityType: Entity
): BindingRow[] => {
    if (!specBindings || specBindings.length === 0) {
        return [];
    }

    const totals = accumulateBindingStats(taskStatsByInterval, entityType);

    return specBindings.map((binding, index): BindingRow => {
        // `source` may be a string or a FullSource object, and captures use
        // `target` instead, so let the shared helper work it out.
        const collection = getCollectionName(binding) ?? '';

        return {
            collection,
            index,
            resourcePath: getResourcePath(binding.resource, collection),
            // `disable` is absent rather than false on an enabled binding.
            status: binding.disable ? 'disabled' : 'enabled',
            // Captures have no upstream frontier to be behind, and a
            // materialization's readings are attached afterward by
            // `attachBacklogReadings`.
            bytesBehind: null,
            secondsBehind: null,
            ...(totals.get(collection) ?? {
                bytes: 0,
                docs: 0,
                lastPublishedAt: null,
            }),
        };
    });
};

/**
 * Attaches per-binding backlog/time-lag readings to spec-built rows, matched by
 * collection name.
 *
 * A pure join rather than folded into `buildBindingRows`: the backlog and
 * time-lag queries resolve on their own schedule, so the rows render before
 * either answers and this runs again each time one does.
 */
export const attachBacklogReadings = (
    rows: BindingRow[],
    backlog: MaterializationBacklog | null,
    timeLag: MaterializationTimeLag | null
): BindingRow[] => {
    if (!backlog) {
        return rows;
    }

    const bytesBehindByCollection = new Map(
        backlog.bindings.map(({ collectionName, bytesBehind }) => [
            collectionName,
            bytesBehind,
        ])
    );
    const secondsBehindByCollection = new Map(
        timeLag?.bindings.map(({ collectionName, seconds }) => [
            collectionName,
            seconds,
        ]) ?? []
    );

    // Status is deliberately not consulted: a recently disabled binding still
    // named by the latest stats row keeps that row's reading, which describes
    // real backlog the task had at that moment.
    return rows.map((row) => ({
        ...row,
        // `.get` returning undefined (collection absent from the reading) is
        // distinct from a real 0, which `??` leaves untouched.
        bytesBehind: bytesBehindByCollection.get(row.collection) ?? null,
        secondsBehind: secondsBehindByCollection.get(row.collection) ?? null,
    }));
};

/**
 * Which of two independent query failures `useBindings` should surface.
 *
 * A failed backlog fetch leaves every row's `bytesBehind`/`secondsBehind` at
 * `null` — the same shape as "caught up" — so dropping that error would render
 * those columns as quietly current. The stats error still takes precedence when
 * both are present: it blanks every column, not just the two lag ones.
 */
export const combineBindingsError = (
    statsError: unknown,
    backlogError: unknown
): unknown => statsError ?? backlogError;

export const countBindings = (rows: BindingRow[]): BindingCounts => {
    const enabled = rows.filter((row) => row.status === 'enabled').length;

    return {
        all: rows.length,
        enabled,
        disabled: rows.length - enabled,
    };
};

/**
 * Everything the task moved over the selected range.
 *
 * Counts each collection once, not each row. `catalog_stats` breaks volume down
 * per collection rather than per binding, so two bindings on one collection — a
 * materialization writing one collection to two tables is ordinary — each carry
 * that collection's whole figure, and summing rows would report more than the
 * task moved.
 */
export const getVolumeTotals = (rows: BindingRow[]): { totalBytes: number } => {
    const countedCollections = new Set<string>();
    let totalBytes = 0;

    for (const row of rows) {
        if (!countedCollections.has(row.collection)) {
            countedCollections.add(row.collection);
            totalBytes += row.bytes;
        }
    }

    return { totalBytes };
};

const compareStrings = (left: string, right: string) =>
    left.localeCompare(right);

const compareNumbers = (left: number, right: number) => left - right;

// A row with no reading is treated as caught up rather than as an unknown worth
// surfacing first. -1 is safe because a real reading is never negative, and it
// keeps this a plain subtraction.
const compareBehind = (left: number | null, right: number | null) =>
    compareNumbers(left ?? -1, right ?? -1);

const comparators: Record<
    BindingSortKey,
    (left: BindingRow, right: BindingRow) => number
> = {
    bytes: (left, right) => compareNumbers(left.bytes, right.bytes),
    bytesBehind: (left, right) =>
        compareBehind(left.bytesBehind, right.bytesBehind),
    collection: (left, right) =>
        compareStrings(left.collection, right.collection),
    docs: (left, right) => compareNumbers(left.docs, right.docs),
    // A binding that moved nothing in the window has no timestamp, and sorts as
    // older than everything that does.
    lastPublishedAt: (left, right) =>
        compareStrings(left.lastPublishedAt ?? '', right.lastPublishedAt ?? ''),
    resourcePath: (left, right) =>
        compareStrings(left.resourcePath, right.resourcePath),
    secondsBehind: (left, right) =>
        compareBehind(left.secondsBehind, right.secondsBehind),
};

export const sortBindings = (
    rows: BindingRow[],
    sortKey: BindingSortKey,
    direction: SortDirection
): BindingRow[] => {
    const comparator = comparators[sortKey];
    const sign = direction === 'asc' ? 1 : -1;

    // Sort a copy: the input is a memoised value shared with the caller.
    return rows.slice().sort((left, right) => {
        const result = comparator(left, right);

        // Break ties on collection name so paging is stable when many rows
        // share a value — every zero-volume binding ties on bytes and docs.
        return result === 0
            ? compareStrings(left.collection, right.collection)
            : result * sign;
    });
};

export const filterBindings = (
    rows: BindingRow[],
    { query, status }: BindingsFilterState
): BindingRow[] => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery && status === 'all') {
        return rows;
    }

    return rows.filter((row) => {
        if (status !== 'all' && row.status !== status) {
            return false;
        }

        if (!trimmedQuery) {
            return true;
        }

        return (
            row.collection.toLowerCase().includes(trimmedQuery) ||
            row.resourcePath.toLowerCase().includes(trimmedQuery)
        );
    });
};
