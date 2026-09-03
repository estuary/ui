import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type {
    MaterializationBacklog,
    MaterializationTimeLag,
} from 'src/hooks/details/shared';
import type { LiveSpecBinding } from 'src/hooks/useLiveSpecs';
import type { TaskStats } from 'src/types';

import {
    accumulateBindingStats,
    attachBacklogReadings,
    buildBindingRows,
    combineBindingsError,
    countBindings,
    filterBindings,
    getResourcePath,
    getVolumeTotals,
    readVolume,
    sortBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';

const row = (overrides: Partial<BindingRow> = {}): BindingRow => ({
    bytes: 0,
    bytesBehind: null,
    collection: 'acmeco/one',
    docs: 0,
    index: 0,
    lastPublishedAt: null,
    resourcePath: 'one',
    secondsBehind: null,
    status: 'enabled',
    ...overrides,
});

describe('getResourcePath', () => {
    test('prefers the connector-declared _meta.path', () => {
        expect(
            getResourcePath(
                { _meta: { path: ['public', 'orders'] }, stream: 'ignored' },
                'acmeco/o'
            )
        ).toBe('public.orders');
    });

    test('handles a single-segment _meta.path', () => {
        expect(
            getResourcePath({ _meta: { path: ['greetings'] } }, 'acmeco/o')
        ).toBe('greetings');
    });

    // Regression: source-hello-world puts a greeting template in `prefix`, and
    // treating that as a namespace rendered the binding "Hello {}!.greetings".
    test('ignores prefix as a namespace, using _meta.path instead', () => {
        expect(
            getResourcePath(
                {
                    _meta: { path: ['greetings'] },
                    name: 'greetings',
                    prefix: 'Hello {}!',
                },
                'sean/test/events'
            )
        ).toBe('greetings');
    });

    test('does not treat prefix as a namespace even without _meta.path', () => {
        expect(
            getResourcePath(
                { name: 'greetings', prefix: 'Hello {}!' },
                'sean/test/events'
            )
        ).toBe('greetings');
    });

    test('qualifies the stream name with its schema', () => {
        expect(
            getResourcePath({ schema: 'public', stream: 'orders' }, 'acmeco/o')
        ).toBe('public.orders');
    });

    test('prefers stream over other candidate keys', () => {
        expect(
            getResourcePath({ name: 'ignored', stream: 'orders' }, 'acmeco/o')
        ).toBe('orders');
    });

    test('joins a path array', () => {
        expect(
            getResourcePath({ path: ['bucket', 'events'] }, 'acmeco/o')
        ).toBe('bucket.events');
    });

    test('uses the database qualifier when there is no schema', () => {
        expect(
            getResourcePath(
                { collection: 'users', database: 'app' },
                'acmeco/o'
            )
        ).toBe('app.users');
    });

    test('falls back to the collection name when the resource is unrecognised', () => {
        expect(
            getResourcePath({ somethingElse: 1 }, 'acmeco/team/orders')
        ).toBe('orders');
    });

    test('falls back when the resource is missing entirely', () => {
        expect(getResourcePath(undefined, 'acmeco/team/orders')).toBe('orders');
    });

    test('ignores an empty string rather than showing a blank name', () => {
        expect(getResourcePath({ stream: '' }, 'acmeco/team/orders')).toBe(
            'orders'
        );
    });
});

describe('readVolume', () => {
    // The whole point of the distinction: `out` and `right` are both present and
    // both summed on a materialization, but only `right` is what the task's own
    // bytes_read_by_me is accumulated from.
    test('a capture reads out', () => {
        expect(
            readVolume({ out: { bytesTotal: 10, docsTotal: 2 } }, 'capture')
        ).toEqual({ bytes: 10, docs: 2 });
    });

    test('a materialization reads right, not out', () => {
        const stats = {
            out: { bytesTotal: 999, docsTotal: 999 },
            right: { bytesTotal: 10, docsTotal: 2 },
        } as any;

        expect(readVolume(stats, 'materialization')).toEqual({
            bytes: 10,
            docs: 2,
        });
    });

    test('treats absent stats as zero rather than undefined', () => {
        expect(readVolume(undefined, 'capture')).toEqual({ bytes: 0, docs: 0 });
    });
});

describe('buildBindingRows', () => {
    const captureBindings: LiveSpecBinding[] = [
        { resource: { stream: 'orders' }, target: 'acmeco/orders' },
        {
            disable: true,
            resource: { stream: 'refunds' },
            target: 'acmeco/refunds',
        },
    ];

    const captureStats: TaskStats = {
        capture: {
            'acmeco/orders': { out: { bytesTotal: 500, docsTotal: 5 } },
        },
    };

    test('includes disabled bindings, which writes_to would omit', () => {
        const rows = buildBindingRows(
            captureBindings,
            [captureStats],
            'capture'
        );

        expect(rows).toHaveLength(2);
        expect(rows[1]).toMatchObject({
            collection: 'acmeco/refunds',
            status: 'disabled',
        });
    });

    test('attaches stats by collection name and zero-fills the rest', () => {
        const rows = buildBindingRows(
            captureBindings,
            [captureStats],
            'capture'
        );

        expect(rows[0]).toMatchObject({ bytes: 500, docs: 5 });
        expect(rows[1]).toMatchObject({ bytes: 0, docs: 0 });
    });

    test('resolves a materialization source given as a FullSource object', () => {
        const rows = buildBindingRows(
            [
                {
                    resource: { table: 'orders' },
                    source: { name: 'acmeco/orders' },
                },
            ],
            [
                {
                    materialize: {
                        'acmeco/orders': {
                            right: { bytesTotal: 20, docsTotal: 1 },
                        },
                    },
                },
            ],
            'materialization'
        );

        expect(rows[0]).toMatchObject({
            bytes: 20,
            collection: 'acmeco/orders',
            docs: 1,
        });
    });

    test('renders rows before stats have arrived', () => {
        const rows = buildBindingRows(captureBindings, null, 'capture');

        expect(rows).toHaveLength(2);
        expect(rows[0].bytes).toBe(0);
    });

    test('returns nothing for a spec with no bindings', () => {
        expect(buildBindingRows([], [captureStats], 'capture')).toEqual([]);
        expect(buildBindingRows(undefined, [captureStats], 'capture')).toEqual(
            []
        );
    });

    test('keeps both rows when a spec binds the same collection twice', () => {
        const rows = buildBindingRows(
            [
                { resource: { stream: 'a' }, target: 'acmeco/orders' },
                { resource: { stream: 'b' }, target: 'acmeco/orders' },
            ],
            [captureStats],
            'capture'
        );

        expect(rows.map((r) => r.index)).toEqual([0, 1]);
    });

    // Neither entity type gets a reading from this join: a capture has no
    // upstream frontier to be behind at all, and a materialization's readings
    // only arrive later, from `attachBacklogReadings`. Both must land here as
    // null, not 0 — a real 0 means "caught up", which this function has no
    // basis to claim before a backlog reading exists.
    test('leaves bytesBehind and secondsBehind null for every entity type', () => {
        const [captureRow] = buildBindingRows(
            captureBindings,
            [captureStats],
            'capture'
        );

        expect(captureRow).toMatchObject({
            bytesBehind: null,
            secondsBehind: null,
        });

        const [materializationRow] = buildBindingRows(
            [
                {
                    resource: { table: 'orders' },
                    source: { name: 'acmeco/orders' },
                },
            ],
            [
                {
                    materialize: {
                        'acmeco/orders': {
                            right: { bytesTotal: 20, docsTotal: 1 },
                        },
                    },
                },
            ],
            'materialization'
        );

        expect(materializationRow).toMatchObject({
            bytesBehind: null,
            secondsBehind: null,
        });
    });

    test('sums a binding across the intervals of the window', () => {
        const rows = buildBindingRows(
            captureBindings,
            [
                captureStats,
                {
                    capture: {
                        'acmeco/orders': {
                            out: { bytesTotal: 250, docsTotal: 3 },
                        },
                    },
                },
            ],
            'capture'
        );

        expect(rows[0]).toMatchObject({ bytes: 750, docs: 8 });
    });
});

describe('accumulateBindingStats', () => {
    const interval = (bytes: number, docs: number): TaskStats => ({
        capture: {
            'acmeco/orders': { out: { bytesTotal: bytes, docsTotal: docs } },
        },
    });

    test('adds every interval of the window', () => {
        expect(
            accumulateBindingStats(
                [interval(100, 1), interval(200, 2), interval(300, 3)],
                'capture'
            ).get('acmeco/orders')
        ).toEqual({ bytes: 600, docs: 6, lastPublishedAt: null });
    });

    // An interval a binding contributed nothing to is a gap in the series, not a
    // reset — zeroing on it would make a quiet hour erase a busy one.
    test('an interval missing the binding does not zero its running total', () => {
        expect(
            accumulateBindingStats(
                [interval(100, 1), { capture: {} }, interval(50, 1)],
                'capture'
            ).get('acmeco/orders')
        ).toEqual({ bytes: 150, docs: 2, lastPublishedAt: null });
    });

    test('an interval with no stats at all is skipped', () => {
        expect(
            accumulateBindingStats([{}, interval(10, 1)], 'capture').get(
                'acmeco/orders'
            )
        ).toEqual({ bytes: 10, docs: 1, lastPublishedAt: null });
    });

    // The out-vs-right correction has to survive the summing, not just a single
    // interval: `out` is present and summed on a materialization too.
    test('a materialization sums right across intervals, never out', () => {
        const materializeInterval = (bytes: number): TaskStats => ({
            materialize: {
                'acmeco/orders': {
                    out: { bytesTotal: 999, docsTotal: 999 },
                    right: { bytesTotal: bytes, docsTotal: 1 },
                } as any,
            },
        });

        expect(
            accumulateBindingStats(
                [materializeInterval(10), materializeInterval(20)],
                'materialization'
            ).get('acmeco/orders')
        ).toEqual({ bytes: 30, docs: 2, lastPublishedAt: null });
    });

    test('reads the branch matching the entity, so a capture ignores materialize', () => {
        expect(
            accumulateBindingStats(
                [
                    {
                        materialize: {
                            'acmeco/orders': {
                                right: { bytesTotal: 10, docsTotal: 1 },
                            },
                        },
                    },
                ],
                'capture'
            ).size
        ).toBe(0);
    });

    test('is empty before any stats have arrived', () => {
        expect(accumulateBindingStats(null, 'capture').size).toBe(0);
        expect(accumulateBindingStats(undefined, 'capture').size).toBe(0);
        expect(accumulateBindingStats([], 'capture').size).toBe(0);
    });

    // Volumes add up across intervals; the timestamp must not. Within one
    // interval the field is a frontier, so the window's answer is the newest.
    test('takes the newest timestamp across intervals, not the last one seen', () => {
        const at = (iso: string, bytes: number): TaskStats => ({
            capture: {
                'acmeco/orders': {
                    out: { bytesTotal: bytes, docsTotal: 1 },
                    lastPublishedAt: iso,
                },
            },
        });

        expect(
            accumulateBindingStats(
                [
                    at('2026-08-06T10:00:00Z', 10),
                    at('2026-08-06T12:00:00Z', 10),
                    // Arrives last but is older — last-write-wins would take it.
                    at('2026-08-06T11:00:00Z', 10),
                ],
                'capture'
            ).get('acmeco/orders')
        ).toEqual({
            bytes: 30,
            docs: 3,
            lastPublishedAt: '2026-08-06T12:00:00Z',
        });
    });

    test('a materialization reads lastSourcePublishedAt, not lastPublishedAt', () => {
        expect(
            accumulateBindingStats(
                [
                    {
                        materialize: {
                            'acmeco/orders': {
                                right: { bytesTotal: 1, docsTotal: 1 },
                                lastSourcePublishedAt: '2026-08-06T12:00:00Z',
                                // The capture-side key, which must be ignored.
                                lastPublishedAt: '2026-08-06T23:00:00Z',
                            } as any,
                        },
                    },
                ],
                'materialization'
            ).get('acmeco/orders')?.lastPublishedAt
        ).toBe('2026-08-06T12:00:00Z');
    });

    test('a binding that moved data but carries no timestamp reports null', () => {
        expect(
            accumulateBindingStats(
                [
                    {
                        capture: {
                            'acmeco/orders': {
                                out: { bytesTotal: 5, docsTotal: 1 },
                            },
                        },
                    },
                ],
                'capture'
            ).get('acmeco/orders')?.lastPublishedAt
        ).toBeNull();
    });

    // An interval can stamp a frontier while the binding moved nothing in it —
    // a materialization advancing past source documents it filtered out, say.
    // Reporting that as "last data" would put a time beside a zero.
    test('ignores a timestamp from an interval that moved nothing', () => {
        expect(
            accumulateBindingStats(
                [
                    {
                        materialize: {
                            'acmeco/orders': {
                                right: { bytesTotal: 0, docsTotal: 0 },
                                lastSourcePublishedAt: '2026-08-06T23:00:00Z',
                            } as any,
                        },
                    },
                ],
                'materialization'
            ).get('acmeco/orders')
        ).toEqual({ bytes: 0, docs: 0, lastPublishedAt: null });
    });

    // The guard is per interval, not per binding: a quiet interval must not
    // discard the timestamp of a busy one.
    test('keeps the timestamp of a busy interval beside a silent one', () => {
        expect(
            accumulateBindingStats(
                [
                    {
                        capture: {
                            'acmeco/orders': {
                                out: { bytesTotal: 20, docsTotal: 2 },
                                lastPublishedAt: '2026-08-06T10:00:00Z',
                            },
                        },
                    },
                    {
                        capture: {
                            'acmeco/orders': {
                                out: { bytesTotal: 0, docsTotal: 0 },
                                lastPublishedAt: '2026-08-06T23:00:00Z',
                            },
                        },
                    },
                ],
                'capture'
            ).get('acmeco/orders')
        ).toEqual({
            bytes: 20,
            docs: 2,
            lastPublishedAt: '2026-08-06T10:00:00Z',
        });
    });
});

describe('attachBacklogReadings', () => {
    const backlog = (
        bindings: Array<{
            collectionName: string;
            bytesBehind: number;
        }>
    ): MaterializationBacklog => ({
        bindings: bindings.map((b) => ({ ...b, lastSourcePublishedAt: '' })),
        bytesBehind: bindings.reduce((sum, b) => sum + b.bytesBehind, 0),
        ts: '2026-08-07T20:00:00Z',
    });

    const timeLag = (
        bindings: Array<{ collectionName: string; seconds: number }>
    ): MaterializationTimeLag => ({
        bindings,
        seconds: Math.max(0, ...bindings.map((b) => b.seconds)),
    });

    // Every capture, and a materialization before its backlog query has
    // resolved: `buildBindingRows` already left both fields null, and that is
    // the correct answer in both cases, not just a placeholder.
    test('leaves rows untouched when there is no backlog yet', () => {
        const rows = [row({ collection: 'acmeco/one' })];

        expect(attachBacklogReadings(rows, null, null)).toEqual(rows);
    });

    test('attaches bytesBehind by collection name', () => {
        const rows = [
            row({ collection: 'acmeco/orders' }),
            row({ collection: 'acmeco/shipments' }),
        ];

        const attached = attachBacklogReadings(
            rows,
            backlog([
                { collectionName: 'acmeco/orders', bytesBehind: 1000 },
                { collectionName: 'acmeco/shipments', bytesBehind: 0 },
            ]),
            null
        );

        expect(attached.map((r) => r.bytesBehind)).toEqual([1000, 0]);
    });

    // A reading of exactly 0 means caught up, a real answer that must survive
    // `?? null` untouched — only a genuinely absent (undefined) entry should
    // fall back to null.
    test('keeps a real zero reading distinct from a missing one', () => {
        const rows = [
            row({ collection: 'acmeco/orders' }),
            row({ collection: 'acmeco/untracked' }),
        ];

        const attached = attachBacklogReadings(
            rows,
            backlog([{ collectionName: 'acmeco/orders', bytesBehind: 0 }]),
            null
        );

        expect(attached[0].bytesBehind).toBe(0);
        expect(attached[1].bytesBehind).toBeNull();
    });

    // The time-lag query is a second request chained off the backlog one (see
    // `useMaterializationBacklog`), so bytesBehind can be known well before
    // secondsBehind is: each field's absence is independent.
    test('attaches secondsBehind independently of bytesBehind', () => {
        const rows = [row({ collection: 'acmeco/orders' })];

        const withoutTimeLag = attachBacklogReadings(
            rows,
            backlog([{ collectionName: 'acmeco/orders', bytesBehind: 1000 }]),
            null
        );

        expect(withoutTimeLag[0].bytesBehind).toBe(1000);
        expect(withoutTimeLag[0].secondsBehind).toBeNull();

        const withTimeLag = attachBacklogReadings(
            rows,
            backlog([{ collectionName: 'acmeco/orders', bytesBehind: 1000 }]),
            timeLag([{ collectionName: 'acmeco/orders', seconds: 42 }])
        );

        expect(withTimeLag[0].secondsBehind).toBe(42);
    });

    // A binding the newest stats row didn't cover (see `newestBindingStats`)
    // gets no reading rather than being assumed caught up.
    test('leaves a row null when its collection is absent from the reading', () => {
        const rows = [row({ collection: 'acmeco/untracked' })];

        const attached = attachBacklogReadings(
            rows,
            backlog([{ collectionName: 'acmeco/orders', bytesBehind: 1000 }]),
            timeLag([{ collectionName: 'acmeco/orders', seconds: 42 }])
        );

        expect(attached[0].bytesBehind).toBeNull();
        expect(attached[0].secondsBehind).toBeNull();
    });

    test('does not mutate its input rows', () => {
        const rows = [row({ collection: 'acmeco/orders' })];

        attachBacklogReadings(
            rows,
            backlog([{ collectionName: 'acmeco/orders', bytesBehind: 1000 }]),
            null
        );

        expect(rows[0].bytesBehind).toBeNull();
    });
});

describe('countBindings', () => {
    test('splits enabled from disabled', () => {
        expect(
            countBindings([
                row({ status: 'enabled' }),
                row({ status: 'disabled' }),
                row({ status: 'disabled' }),
            ])
        ).toEqual({ all: 3, disabled: 2, enabled: 1 });
    });
});

describe('getVolumeTotals', () => {
    test('sums the total across bindings', () => {
        expect(
            getVolumeTotals([
                row({ bytes: 10, collection: 'acmeco/a' }),
                row({ bytes: 30, collection: 'acmeco/b' }),
                row({ bytes: 20, collection: 'acmeco/c' }),
            ])
        ).toEqual({ totalBytes: 60 });
    });

    // `catalog_stats` breaks volume down per collection, not per binding, so two
    // bindings on one collection both carry its whole figure. Summing rows would
    // report more than the task moved and disagree with the chart.
    test('counts a collection once even when two bindings share it', () => {
        expect(
            getVolumeTotals([
                row({ bytes: 30, collection: 'acmeco/a', index: 0 }),
                row({ bytes: 30, collection: 'acmeco/a', index: 1 }),
                row({ bytes: 10, collection: 'acmeco/b', index: 2 }),
            ])
        ).toEqual({ totalBytes: 40 });
    });

    // The tooltip's share figure divides by the total, so a task that moved
    // nothing must not hand back a figure that turns the share into NaN.
    test('reports zeroes for no rows and for silent rows', () => {
        expect(getVolumeTotals([])).toEqual({ totalBytes: 0 });
        expect(getVolumeTotals([row(), row()])).toEqual({ totalBytes: 0 });
    });
});

describe('sortBindings', () => {
    const rows = [
        row({ bytes: 10, collection: 'acmeco/b', docs: 1 }),
        row({ bytes: 30, collection: 'acmeco/a', docs: 3 }),
        row({ bytes: 20, collection: 'acmeco/c', docs: 2 }),
    ];

    test('sorts by bytes descending', () => {
        expect(sortBindings(rows, 'bytes', 'desc').map((r) => r.bytes)).toEqual(
            [30, 20, 10]
        );
    });

    test('sorts by bytes ascending', () => {
        expect(sortBindings(rows, 'bytes', 'asc').map((r) => r.bytes)).toEqual([
            10, 20, 30,
        ]);
    });

    test('sorts by collection name', () => {
        expect(
            sortBindings(rows, 'collection', 'asc').map((r) => r.collection)
        ).toEqual(['acmeco/a', 'acmeco/b', 'acmeco/c']);
    });

    test('sorts by source stream', () => {
        const streams = [
            row({ collection: 'acmeco/b', resourcePath: 'public.b' }),
            row({ collection: 'acmeco/a', resourcePath: 'public.a' }),
        ];

        expect(
            sortBindings(streams, 'resourcePath', 'asc').map(
                (r) => r.resourcePath
            )
        ).toEqual(['public.a', 'public.b']);
    });

    // Every zero-volume binding ties, and an unstable order would make rows
    // appear on two different pages or none.
    test('breaks ties on collection name so paging is stable', () => {
        const tied = [
            row({ bytes: 0, collection: 'acmeco/c' }),
            row({ bytes: 0, collection: 'acmeco/a' }),
            row({ bytes: 0, collection: 'acmeco/b' }),
        ];

        expect(
            sortBindings(tied, 'bytes', 'desc').map((r) => r.collection)
        ).toEqual(['acmeco/a', 'acmeco/b', 'acmeco/c']);
    });

    test('does not mutate its input', () => {
        const input = [row({ bytes: 1 }), row({ bytes: 2 })];

        sortBindings(input, 'bytes', 'desc');

        expect(input.map((r) => r.bytes)).toEqual([1, 2]);
    });

    // A capture, and a materialization binding the latest backlog skipped, has
    // no reading at all — not a real zero. Sorting it as caught up rather than
    // as an unknown worth surfacing first is the same "missing is least
    // severe" rule `lastPublishedAt` uses.
    test('sorts a missing bytesBehind as caught up, ahead of nothing', () => {
        const withNull = [
            row({ bytesBehind: 500, collection: 'acmeco/a' }),
            row({ bytesBehind: null, collection: 'acmeco/b' }),
            row({ bytesBehind: 0, collection: 'acmeco/c' }),
        ];

        expect(
            sortBindings(withNull, 'bytesBehind', 'desc').map(
                (r) => r.collection
            )
        ).toEqual(['acmeco/a', 'acmeco/c', 'acmeco/b']);
    });

    test('sorts secondsBehind the same way, missing treated as caught up', () => {
        const withNull = [
            row({ collection: 'acmeco/a', secondsBehind: 300 }),
            row({ collection: 'acmeco/b', secondsBehind: null }),
            row({ collection: 'acmeco/c', secondsBehind: 0 }),
        ];

        expect(
            sortBindings(withNull, 'secondsBehind', 'asc').map(
                (r) => r.collection
            )
        ).toEqual(['acmeco/b', 'acmeco/c', 'acmeco/a']);
    });
});

describe('filterBindings', () => {
    const rows = [
        row({ collection: 'acmeco/orders', resourcePath: 'public.orders' }),
        row({
            collection: 'acmeco/refunds',
            resourcePath: 'public.refunds',
            status: 'disabled',
        }),
    ];

    test('returns everything by default', () => {
        expect(filterBindings(rows, { query: '', status: 'all' })).toHaveLength(
            2
        );
    });

    test('filters by status', () => {
        expect(
            filterBindings(rows, { query: '', status: 'disabled' })
        ).toHaveLength(1);
    });

    test('matches the collection name', () => {
        expect(
            filterBindings(rows, { query: 'refund', status: 'all' })
        ).toHaveLength(1);
    });

    test('matches the source stream, which is the name a customer reports', () => {
        expect(
            filterBindings(rows, { query: 'public.ord', status: 'all' })
        ).toHaveLength(1);
    });

    test('ignores case and surrounding whitespace', () => {
        expect(
            filterBindings(rows, { query: '  ORDERS  ', status: 'all' })
        ).toHaveLength(1);
    });

    test('combines search with status', () => {
        expect(
            filterBindings(rows, { query: 'orders', status: 'disabled' })
        ).toHaveLength(0);
    });
});

describe('combineBindingsError', () => {
    test('reports neither error when both requests succeeded', () => {
        expect(combineBindingsError(undefined, undefined)).toBeUndefined();
    });

    test('reports the stats error alone', () => {
        const statsError = new Error('stats request failed');

        expect(combineBindingsError(statsError, undefined)).toBe(statsError);
    });

    test('reports the backlog error alone', () => {
        const backlogError = new Error('backlog request failed');

        expect(combineBindingsError(undefined, backlogError)).toBe(
            backlogError
        );
    });

    // Regression: a failed backlog fetch leaves bytesBehind/secondsBehind at
    // null on every row — indistinguishable from "not attached yet" — so
    // dropping this error would render a materialization as quietly caught up
    // instead of erroring. The stats error still wins when both are present,
    // because it blanks the whole table rather than just the two lag columns.
    test('prefers the stats error when both requests failed', () => {
        const statsError = new Error('stats request failed');
        const backlogError = new Error('backlog request failed');

        expect(combineBindingsError(statsError, backlogError)).toBe(statsError);
    });
});
