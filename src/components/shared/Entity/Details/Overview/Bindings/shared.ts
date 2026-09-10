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

// formatBytes always renders 2 fraction digits ("1.20 GB", "854.00 MB"), but
// the unit segment's width still shifts the digits left/right between rows.
// Splitting the digits from the unit and right-aligning the digits in a fixed
// box keeps the decimal point lined up vertically down the column, the way
// Vercel's numeric table columns do.
//
// A plain split on the space `formatBytes` (via `prettyBytes`) always emits
// between the number and unit — verified against the library's default
// `space: true` behaviour, which this call never overrides — rather than a
// regex re-deriving a shape the string is already guaranteed to have.
export const splitFormattedBytes = (formatted: string): [string, string] => {
    const spaceIndex = formatted.indexOf(' ');
    return spaceIndex === -1
        ? [formatted, '']
        : [formatted.slice(0, spaceIndex), formatted.slice(spaceIndex + 1)];
};

// A capture's rows carry a source stream as well as a collection, so its search
// covers both. Read from here rather than branching at each call site: the
// Storybook harness has to word this the same way the page does, or a story
// shows something the app never shows.
export const getSearchLabelId = (entityType: Entity): string =>
    entityType === 'materialization'
        ? 'detailsPanel.bindings.search.materialization'
        : 'detailsPanel.bindings.search.capture';

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
 * full per-binding breakdown, so the window total is the sum over rows. This is
 * the same accumulation the task's own `bytes_written_by_me`/`bytes_read_by_me`
 * get in the chart above the table, which is what keeps the two agreeing.
 *
 * A collection absent from an interval simply contributed nothing to it; it is
 * not an error, and it must not zero out the intervals where it did appear.
 *
 * Volumes sum. The timestamp takes the maximum *of the intervals that moved
 * data*, which is two decisions:
 *
 * - Maximum across intervals, because within one interval the field is
 *   last-write-wins and means "the frontier as of that interval", so the newest
 *   of those is the one the selected window is asking about. This is a different
 *   question from the one the stats pipeline answers, where a `maximize` reduce
 *   would be wrong — see `MaterializeBindingStats` in `src/types`. There the
 *   field tracks a catch-up frontier over all time and must be free to go
 *   backwards; here the window is fixed, so taking its newest cannot hide a task
 *   falling behind.
 * - Only from intervals with volume, because an interval can carry a timestamp
 *   while the binding moved nothing in it. Reporting that as "last data" would
 *   put a time in the column beside a zero, which the table elsewhere promises
 *   not to do.
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

            // See the note above: a timestamp only counts from an interval that
            // actually moved something.
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
            // Neither figure comes from the spec/stats join this function does —
            // captures have no upstream frontier to be behind, and a
            // materialization's readings are attached afterward by
            // `attachBacklogReadings` once its backlog query resolves. Null here
            // is simply "not attached yet", same meaning it has everywhere else
            // on the row.
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
 * time-lag queries resolve on their own schedule (a second request, chained
 * off the first — see `useMaterializationBacklog`), so the rows exist and
 * render before either answers, and this runs again each time one does.
 */
export const attachBacklogReadings = (
    rows: BindingRow[],
    backlog: MaterializationBacklog | null,
    timeLag: MaterializationTimeLag | null
): BindingRow[] => {
    // Captures never get here (see `useBindings`), and a materialization whose
    // backlog hasn't loaded yet simply hasn't attached readings; either way the
    // null every row already carries from `buildBindingRows` is the answer.
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

    // Matched by collection name rather than by `status`: a binding disabled
    // recently enough that the latest hourly stats row still names it keeps
    // whatever reading that row carries, rather than being forced back to
    // null. That is the correct reading, not a stale leftover — the row
    // describes real backlog the task had at that moment, disabled binding or
    // not, and disabling doesn't retroactively erase it. `buildBindingRows`
    // already surfaces disabled bindings for the same reason (see its own
    // comment); this join simply doesn't special-case status at all.
    return rows.map((row) => ({
        ...row,
        // `.get` returning undefined (collection absent from the reading) is
        // distinct from a real 0: `??` only substitutes on nullish, so a
        // genuine "caught up" reading of 0 survives untouched.
        bytesBehind: bytesBehindByCollection.get(row.collection) ?? null,
        secondsBehind: secondsBehindByCollection.get(row.collection) ?? null,
    }));
};

/**
 * Which of two independent query failures `useBindings` should surface.
 *
 * A failed backlog/time-lag fetch leaves every row's `bytesBehind`/
 * `secondsBehind` at `null` — the same shape as "not attached yet" or
 * "caught up" — so silently dropping that error would render those columns as
 * quietly current instead of erroring, the exact trap `BacklogSection`'s own
 * comment warns about at the task level. But the stats error takes
 * precedence when both are present: it blanks names, statuses and every
 * other column, not just the two lag ones, so it is the more consequential
 * of the two and the one a single error slot should report.
 *
 * Pulled out of `useBindings` as a pure function rather than left as an
 * inline `??`, purely so this precedence rule has a unit test — the hook
 * itself is thin SWR wiring with no test of its own in this codebase, and
 * getting this one line backwards would silently swap which failure a
 * customer's screenshot shows.
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
 * The total counts each collection once, not each row. `catalog_stats` breaks
 * volume down per collection, not per binding, so two bindings on one collection
 * — a materialization writing one collection to two tables is ordinary — each
 * carry that collection's whole figure. Summing rows would then report more than
 * the task moved, and disagree with the chart above it. Nothing better is
 * available per row: there is no per-binding split to attribute.
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

// A row with no reading — every capture, and a materialization binding the
// latest backlog didn't cover — is treated as caught up rather than as an
// unknown worth surfacing first, the same "missing is least severe" rule
// `lastPublishedAt` uses below. -1 is a safe stand-in because a real reading
// is never negative, and it keeps this a plain subtraction (no NaN from
// `Infinity - Infinity` if both sides are missing).
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
    // A binding that moved nothing in the window has no timestamp. Treated as
    // older than everything that does, so descending puts the live bindings
    // first and ascending groups the silent ones at the top — which is the
    // reason to sort this column at all.
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
