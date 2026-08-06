import type {
    BindingCounts,
    BindingRow,
    BindingsFilterState,
    BindingSortKey,
    BindingVolume,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
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
export const DEFAULT_BINDINGS_PER_PAGE = 25;

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

// Qualifiers that read naturally as a prefix on the name above. Deliberately
// excludes `prefix`, which is not reliably a namespace: source-hello-world uses
// it for a greeting template, so treating it as one rendered a binding as
// "Hello {}!.greetings".
const RESOURCE_NAMESPACE_KEYS = ['schema', 'namespace', 'database'];

const asDisplayValue = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    // Resources are often expressed as a path array. Joined with a dot, the same
    // way `_meta.path` is, because these read as qualified names
    // ("public.orders") rather than as file paths.
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
 * `resource._meta.path` is the authoritative answer where it exists: it is the
 * resource path the connector itself declared at discovery, it is present on
 * every binding a recent agent wrote, and `getBindingIndexByResourcePath`
 * already treats it as the identity of a binding. Guessing from field names is
 * only a fallback for older specs.
 *
 * Falls back to the collection's own last path segment so the column is never
 * blank: an unrecognised resource shape should still leave the row identifiable.
 */
export const getResourcePath = (
    resource: Record<string, any> | undefined,
    collection: string
): string => {
    const fallback = collection.split('/').at(-1) ?? collection;

    if (!resource || typeof resource !== 'object') {
        return fallback;
    }

    const declaredPath = asDisplayValue(resource._meta?.path);

    if (declaredPath) {
        // Joined with a dot rather than a slash: these read as qualified names
        // ("public.orders"), not as file paths.
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
export const readVolume = (
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
 * Per-binding freshness, from whichever field the entity records it in.
 *
 * A capture stamps the document it published; a materialization stamps the
 * *source* document it processed. Different fields, and only loosely the same
 * question — but on their own page each is the honest answer to "when did this
 * binding last move anything", which is what the column asks.
 */
export const readLastPublishedAt = (
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
 * full per-binding breakdown, so the window total is the sum over rows. This is
 * the same accumulation the task's own `bytes_written_by_me`/`bytes_read_by_me`
 * get in the chart above the table, which is what keeps the two agreeing.
 *
 * A collection absent from an interval simply contributed nothing to it; it is
 * not an error, and it must not zero out the intervals where it did appear.
 *
 * Volumes sum; the timestamp takes the maximum. Within one interval the field
 * is last-write-wins and means "the frontier as of that interval" — across
 * intervals the newest of those is the one the window is asking about.
 */
export const accumulateBindingStats = (
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
            const lastPublishedAt = readLastPublishedAt(stats, entityType);
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
            ...(totals.get(collection) ?? {
                bytes: 0,
                docs: 0,
                lastPublishedAt: null,
            }),
        };
    });
};

/**
 * When this task last moved data: the newest of its bindings.
 *
 * The maximum, never an average. Measured against a live production capture
 * (`estuary/hubspot-native`, 15 bindings), the maximum reads 4 minutes — the
 * reporting floor, i.e. "current" — while the mean of the same 15 reads 9.1
 * hours, because two thirds of them are reference tables that legitimately
 * update daily or slower. The mean makes a healthy task look dead, and gets
 * worse the more bindings a task has.
 */
export const getTaskFreshness = (rows: BindingRow[]): string | null =>
    rows.reduce<string | null>(
        (newest, row) =>
            row.lastPublishedAt && (!newest || row.lastPublishedAt > newest)
                ? row.lastPublishedAt
                : newest,
        null
    );

export const countBindings = (rows: BindingRow[]): BindingCounts => {
    const enabled = rows.filter((row) => row.status === 'enabled').length;

    return {
        all: rows.length,
        enabled,
        disabled: rows.length - enabled,
    };
};

/**
 * Everything this task moved over the selected range.
 *
 * Summed from the same per-binding rows the table renders, so the strip's
 * headline and the bindings card's subtitle cannot disagree — they are one
 * number read twice, not two numbers that happen to agree.
 */
export const getTotalBytes = (rows: BindingRow[]): number =>
    rows.reduce((total, row) => total + row.bytes, 0);

const compareStrings = (left: string, right: string) =>
    left.localeCompare(right);

const compareNumbers = (left: number, right: number) => left - right;

const comparators: Record<
    BindingSortKey,
    (left: BindingRow, right: BindingRow) => number
> = {
    bytes: (left, right) => compareNumbers(left.bytes, right.bytes),
    collection: (left, right) =>
        compareStrings(left.collection, right.collection),
    docs: (left, right) => compareNumbers(left.docs, right.docs),
    // A binding that moved nothing in the window has no timestamp. Treated as
    // older than everything that does, so descending puts the live bindings
    // first and ascending groups the silent ones at the top — which is the
    // reason to sort this column at all.
    lastPublishedAt: (left, right) =>
        compareStrings(left.lastPublishedAt ?? '', right.lastPublishedAt ?? ''),
    resourcePath: (left, right) =>
        compareStrings(left.resourcePath, right.resourcePath),
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
