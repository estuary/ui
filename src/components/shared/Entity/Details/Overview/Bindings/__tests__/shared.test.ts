import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { LiveSpecBinding } from 'src/hooks/useLiveSpecs';
import type { TaskStats } from 'src/types';

import {
    accumulateBindingStats,
    buildBindingRows,
    countBindings,
    filterBindings,
    getResourcePath,
    getTaskFreshness,
    readVolume,
    sortBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';

const row = (overrides: Partial<BindingRow> = {}): BindingRow => ({
    bytes: 0,
    collection: 'acmeco/one',
    docs: 0,
    index: 0,
    lastPublishedAt: null,
    resourcePath: 'one',
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
});

describe('getTaskFreshness', () => {
    // The reason this is a maximum. Modelled on estuary/hubspot-native, where
    // the busiest binding sits at the reporting floor and two thirds are
    // reference tables a day or more old — the mean of the real task reads 9.1
    // hours while it is completely current.
    test('takes the newest binding, undragged by dormant ones', () => {
        expect(
            getTaskFreshness([
                row({ lastPublishedAt: '2026-08-04T00:00:00Z' }),
                row({ lastPublishedAt: '2026-08-06T15:00:00Z' }),
                row({ lastPublishedAt: '2026-06-01T00:00:00Z' }),
            ])
        ).toBe('2026-08-06T15:00:00Z');
    });

    test('skips bindings with no timestamp rather than treating them as now', () => {
        expect(
            getTaskFreshness([
                row({ lastPublishedAt: null }),
                row({ lastPublishedAt: '2026-08-06T15:00:00Z' }),
                row({ lastPublishedAt: null }),
            ])
        ).toBe('2026-08-06T15:00:00Z');
    });

    test('reports nothing when no binding moved data in the window', () => {
        expect(getTaskFreshness([row(), row()])).toBeNull();
        expect(getTaskFreshness([])).toBeNull();
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
