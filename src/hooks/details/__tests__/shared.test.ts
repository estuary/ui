import type {
    CatalogStats_Backlog,
    CatalogStats_LastPublished,
} from 'src/types';

import { formatBytes } from 'src/components/tables/cells/stats/shared';
import {
    computeMaterializationTimeLag,
    latestPublishedByCollection,
    parseMaterializationBacklog,
} from 'src/hooks/details/shared';

// Builds one hourly stats row for a task. `catalog_stats.flow_document` holds a
// materialization's per-binding stats under `taskStats.materialize`, keyed by
// source collection name. See ops-catalog/stats.schema.yaml of estuary/flow.
const statsRow = (
    ts: string,
    materialize?: Record<
        string,
        { bytesBehind?: number | string; lastSourcePublishedAt?: string }
    >
): CatalogStats_Backlog => ({
    catalog_name: 'acmeCo/warehouse',
    grain: 'hourly',
    ts,
    flow_document: materialize
        ? { taskStats: { materialize } }
        : { taskStats: {} },
});

describe('parseMaterializationBacklog', () => {
    test('sums the readings of every binding in the row', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: 1000 },
                'acmeCo/shipments': { bytesBehind: 2500 },
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(3500);
    });

    test('reads only the newest row, ignoring older readings', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T18:00:00Z', {
                'acmeCo/orders': { bytesBehind: 2500 },
            }),
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: 1000 },
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(1000);
        expect(backlog?.ts).toBe('2026-08-07T19:00:00Z');
    });

    // A binding omits the field once it has nothing left to read, so an absent
    // reading is zero rather than unknown.
    test('treats a binding with no reading as caught up', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: 1000 },
                'acmeCo/shipments': {},
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(1000);
        expect(backlog?.bindings).toHaveLength(2);
    });

    // A usage heartbeat opens the hour's row without describing any bindings, so
    // the newest row can exist while saying nothing about the task.
    test('skips a newer row that carries no binding stats at all', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T20:00:00Z'),
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: 1000 },
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(1000);
        expect(backlog?.ts).toBe('2026-08-07T19:00:00Z');
    });

    // `bytesBehind` is a u64, and the default JSON encoding for those is a string
    // so large values survive. estuary/flow patches its Rust encoder to emit a
    // number, but the encoding is not uniform across producers.
    test('accepts a reading encoded as a string', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: '1000' },
                'acmeCo/shipments': { bytesBehind: 2500 },
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(3500);
    });

    test('ignores a reading that is neither a number nor numeric', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': { bytesBehind: 'lots' },
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(0);
    });

    // The whole task is current when every binding has caught up, which is what
    // the card shows in place of a figure.
    test('totals zero when no binding reports a reading', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T20:00:00Z', {
                'acmeCo/orders': {},
                'acmeCo/shipments': {},
            }),
        ]);

        expect(backlog?.bytesBehind).toBe(0);
        expect(backlog?.bindings).toHaveLength(2);
    });

    // Captures and collections have no `materialize` stats at all, and neither do
    // materializations that have yet to process anything.
    test('returns null when no row has materialize stats', () => {
        expect(
            parseMaterializationBacklog([statsRow('2026-08-07T20:00:00Z')])
        ).toBeNull();
        expect(parseMaterializationBacklog([])).toBeNull();
    });

    test('carries each binding source timestamp through for the time lag', () => {
        const backlog = parseMaterializationBacklog([
            statsRow('2026-08-07T19:00:00Z', {
                'acmeCo/orders': {
                    lastSourcePublishedAt: '2026-08-07T12:00:00Z',
                },
            }),
        ]);

        expect(backlog?.bindings[0].lastSourcePublishedAt).toBe(
            '2026-08-07T12:00:00Z'
        );
    });

    // A real hourly row from hyphametrics/snowflake/materialize-snowflake, with
    // the per-binding `out` and `right` tallies dropped since nothing reads them.
    // Twelve bindings, of which three are behind. Note the `interval` heartbeat
    // sharing the row with the binding stats.
    describe('a production stats row', () => {
        const row: CatalogStats_Backlog = {
            catalog_name: 'hyphametrics/snowflake/materialize-snowflake',
            grain: 'hourly',
            ts: '2026-08-07T20:00:00.000Z',
            flow_document: {
                taskStats: {
                    materialize: {
                        'hyphametrics/mongodb/raw-personicore/adscatalog': {},
                        'hyphametrics/mongodb/raw-personicore/brandcatalogs':
                            {},
                        'hyphametrics/mongodb/raw-personicore/contentcatalogs':
                            {},
                        'hyphametrics/mongodb/raw-personicore/coremeters': {
                            bytesBehind: 3655,
                        },
                        'hyphametrics/mongodb/raw-personicore/hd_logpresences':
                            {
                                bytesBehind: 587,
                            },
                        'hyphametrics/mongodb/raw-personicore/households': {},
                        'hyphametrics/mongodb/raw-personicore/logcoremeterstats':
                            {},
                        'hyphametrics/mongodb/raw-personicore/mediasources': {},
                        'hyphametrics/mongodb/raw-personicore/panelists': {},
                        'hyphametrics/mongodb/raw-personicore/personaldevices':
                            {},
                        'hyphametrics/mongodb/raw-personicore/routers': {},
                        'hyphametrics/mongodb/raw-personicore/viewershipcontents':
                            {
                                bytesBehind: 1130136,
                            },
                    },
                    interval: { uptimeSeconds: 1800, usageRate: 1 },
                },
            },
        };

        test('totals the three bindings that are behind', () => {
            expect(parseMaterializationBacklog([row])?.bytesBehind).toBe(
                1134378
            );
        });

        test('keeps all twelve bindings, worst first', () => {
            const backlog = parseMaterializationBacklog([row]);

            expect(backlog?.bindings).toHaveLength(12);
            expect(
                backlog?.bindings
                    .filter(({ bytesBehind }) => bytesBehind > 0)
                    .map(({ collectionName, bytesBehind }) => [
                        collectionName,
                        bytesBehind,
                    ])
            ).toEqual([
                [
                    'hyphametrics/mongodb/raw-personicore/viewershipcontents',
                    1130136,
                ],
                ['hyphametrics/mongodb/raw-personicore/coremeters', 3655],
                ['hyphametrics/mongodb/raw-personicore/hd_logpresences', 587],
            ]);
        });

        test('renders the total the way the card does', () => {
            const backlog = parseMaterializationBacklog([row]);

            expect(formatBytes(backlog?.bytesBehind, 1)).toBe('1.1 MB');
        });

        test('reports the stats document timestamp', () => {
            expect(parseMaterializationBacklog([row])?.ts).toBe(
                '2026-08-07T20:00:00.000Z'
            );
        });
    });
});

describe('latestPublishedByCollection', () => {
    const row = (
        catalogName: string,
        lastPublishedAt?: string
    ): CatalogStats_LastPublished => ({
        catalog_name: catalogName,
        grain: 'monthly',
        ts: '2026-08-01T00:00:00Z',
        flow_document: lastPublishedAt
            ? { statsSummary: { lastPublishedAt } }
            : { statsSummary: {} },
    });

    test('keeps the latest timestamp per collection across rows', () => {
        expect(
            latestPublishedByCollection([
                row('acmeCo/orders', '2026-07-31T23:00:00Z'),
                row('acmeCo/orders', '2026-08-07T12:00:00Z'),
                row('acmeCo/shipments', '2026-08-06T09:00:00Z'),
            ])
        ).toEqual({
            'acmeCo/orders': '2026-08-07T12:00:00Z',
            'acmeCo/shipments': '2026-08-06T09:00:00Z',
        });
    });

    // A row written because a materialization read the collection records no
    // publication of its own, so the newest row may carry no timestamp.
    test('ignores rows with no lastPublishedAt', () => {
        expect(
            latestPublishedByCollection([
                row('acmeCo/orders', '2026-08-07T12:00:00Z'),
                row('acmeCo/orders'),
            ])
        ).toEqual({ 'acmeCo/orders': '2026-08-07T12:00:00Z' });
    });
});

describe('computeMaterializationTimeLag', () => {
    test('reports the gap for a binding that is behind', () => {
        const lag = computeMaterializationTimeLag(
            [
                {
                    collectionName: 'acmeCo/orders',
                    lastSourcePublishedAt: '2026-08-07T12:00:00Z',
                },
            ],
            { 'acmeCo/orders': '2026-08-07T12:05:00Z' }
        );

        expect(lag?.seconds).toBe(300);
    });

    test('takes the worst binding, not the sum', () => {
        const lag = computeMaterializationTimeLag(
            [
                {
                    collectionName: 'acmeCo/orders',
                    lastSourcePublishedAt: '2026-08-07T12:00:00Z',
                },
                {
                    collectionName: 'acmeCo/shipments',
                    lastSourcePublishedAt: '2026-08-07T11:00:00Z',
                },
            ],
            {
                'acmeCo/orders': '2026-08-07T12:05:00Z',
                'acmeCo/shipments': '2026-08-07T12:05:00Z',
            }
        );

        expect(lag?.seconds).toBe(3900);
        expect(lag?.bindings[0].collectionName).toBe('acmeCo/shipments');
    });

    // The two timestamps come from rows written by different tasks at different
    // moments, so a binding can sit past its collection's recorded frontier.
    test('clamps a binding that has read past the frontier to zero', () => {
        const lag = computeMaterializationTimeLag(
            [
                {
                    collectionName: 'acmeCo/orders',
                    lastSourcePublishedAt: '2026-08-07T12:05:00Z',
                },
            ],
            { 'acmeCo/orders': '2026-08-07T12:00:00Z' }
        );

        expect(lag?.seconds).toBe(0);
    });

    test('skips bindings missing either timestamp', () => {
        expect(
            computeMaterializationTimeLag(
                [{ collectionName: 'acmeCo/orders' }],
                {
                    'acmeCo/orders': '2026-08-07T12:00:00Z',
                }
            )
        ).toBeNull();

        expect(
            computeMaterializationTimeLag(
                [
                    {
                        collectionName: 'acmeCo/orders',
                        lastSourcePublishedAt: '2026-08-07T12:00:00Z',
                    },
                ],
                {}
            )
        ).toBeNull();
    });

    test('ignores unparseable timestamps', () => {
        expect(
            computeMaterializationTimeLag(
                [
                    {
                        collectionName: 'acmeCo/orders',
                        lastSourcePublishedAt: 'not a timestamp',
                    },
                ],
                { 'acmeCo/orders': '2026-08-07T12:00:00Z' }
            )
        ).toBeNull();
    });
});
