import type { UsageStats } from 'src/hooks/billing/useTaskUsageStats';
import type { UsageTask } from 'src/hooks/billing/useTaskUsageTasks';

import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';

import {
    getBucketLayout,
    resolvePeriod,
} from 'src/components/admin/Billing/usage/period';
import {
    allocateCostCents,
    buildUsageRows,
    DELETED_TASKS,
    formatShare,
    shareSegments,
} from 'src/components/admin/Billing/usage/rows';

const GB = 1e9;
const HOUR = 3600;

const today = DateTime.utc(2026, 11, 9);

const tasks: UsageTask[] = [
    { name: 'acmeCo/source-pg', kind: 'capture', disabled: false },
    { name: 'acmeCo/materialize-sf', kind: 'materialization', disabled: false },
];

// Usage per bucket key, in GB and hours.
const statsOf = (
    entries: Record<string, Record<string, [number, number]>>
): UsageStats =>
    new Map(
        Object.entries(entries).map(([name, buckets]) => [
            name,
            new Map(
                Object.entries(buckets).map(([key, [gb, hours]]) => [
                    key,
                    { bytes: gb * GB, seconds: hours * HOUR },
                ])
            ),
        ])
    );

describe('buildUsageRows', () => {
    const { buckets } = getBucketLayout(
        resolvePeriod({ preset: 'this' }, today),
        today
    );

    test('reads each task by bucket, leaving days to come empty', () => {
        const rows = buildUsageRows(
            tasks,
            'acmeCo/',
            statsOf({
                'acmeCo/source-pg': { '2026-11-01': [2, 24] },
                'acmeCo/materialize-sf': { '2026-11-02': [3, 24] },
                'acmeCo/': { '2026-11-01': [2, 24], '2026-11-02': [3, 24] },
            }),
            buckets,
            null
        );

        expect(rows.map(({ name, gb, hours }) => [name, gb, hours])).toEqual([
            ['acmeCo/source-pg', 2, 24],
            ['acmeCo/materialize-sf', 3, 24],
        ]);
        expect(rows[0].usage[0]).toEqual({ bytes: 2 * GB, seconds: 24 * HOUR });
        expect(rows[0].usage[1]).toEqual({ bytes: 0, seconds: 0 });
        expect(rows[0].usage[9]).toBeNull();
        expect(rows[0].costCents).toBeNull();
    });

    test("puts the tenant's usage beyond its live tasks under Deleted tasks", () => {
        const rows = buildUsageRows(
            tasks,
            'acmeCo/',
            statsOf({
                'acmeCo/source-pg': { '2026-11-01': [2, 24] },
                'acmeCo/materialize-sf': { '2026-11-01': [3, 24] },
                // A moment ahead of its tasks on the 1st; on the 2nd, a
                // deleted task's.
                'acmeCo/': { '2026-11-01': [4, 50], '2026-11-02': [1, 6] },
            }),
            buckets,
            null
        );

        expect(rows).toHaveLength(3);
        expect(rows[2]).toMatchObject({
            name: DELETED_TASKS,
            kind: null,
            gb: 1,
            hours: 8,
        });
        expect(rows[2].usage.slice(0, 2)).toEqual([
            { bytes: 0, seconds: 2 * HOUR },
            { bytes: 1 * GB, seconds: 6 * HOUR },
        ]);
    });
});

describe('cost', () => {
    const charges = {
        // Billed 100 GB for $50 and 1,000 hours for $140.
        '2026-10': { dataCents: 5000, taskCents: 14000, gb: 100, hours: 1000 },
        '2026-11': { dataCents: 1000, taskCents: 1400, gb: 20, hours: 100 },
    };

    test("splits a month's charges by the share of its usage", () => {
        expect(
            allocateCostCents(
                { bytes: 25 * GB, seconds: 100 * HOUR },
                charges['2026-10']
            )
        ).toBeCloseTo(1250 + 1400);
    });

    test('costs nothing in a month without charges', () => {
        expect(allocateCostCents({ bytes: GB, seconds: HOUR }, undefined)).toBe(
            0
        );
        expect(
            allocateCostCents(
                { bytes: GB, seconds: HOUR },
                { dataCents: 0, taskCents: 0, gb: 0, hours: 0 }
            )
        ).toBe(0);
    });

    test("prices part of a month against the whole month's usage", () => {
        // Oct 25 to Nov 3 by day.
        const { buckets } = getBucketLayout(
            resolvePeriod(
                { preset: 'custom', from: '2026-10-25', to: '2026-11-03' },
                today
            ),
            today
        );

        const rows = buildUsageRows(
            tasks.slice(0, 1),
            'acmeCo/',
            statsOf({
                'acmeCo/source-pg': {
                    '2026-10-31': [10, 100],
                    '2026-11-01': [5, 50],
                },
                'acmeCo/': {
                    '2026-10-31': [10, 100],
                    '2026-11-01': [5, 50],
                },
            }),
            buckets,
            charges
        );

        // A tenth of October's data and hours, a quarter of November's data
        // and half its hours.
        expect(rows[0].costCents).toBeCloseTo(500 + 1400 + 250 + 700);
    });

    test('costs nothing for days before the trial ended', () => {
        const daily = getBucketLayout(
            resolvePeriod(
                { preset: 'custom', from: '2026-10-25', to: '2026-11-03' },
                today
            ),
            today
        );

        expect(
            buildUsageRows(
                tasks.slice(0, 1),
                'acmeCo/',
                statsOf({
                    'acmeCo/source-pg': {
                        '2026-10-31': [10, 100],
                        '2026-11-01': [5, 50],
                    },
                }),
                daily.buckets,
                charges,
                '2026-11-01'
            )[0].costCents
        ).toBeCloseTo(250 + 700);

        // By month, October is all trial and November is billed from the
        // 2nd: 8 of its 9 days so far.
        const monthly = getBucketLayout(
            resolvePeriod(
                { preset: 'custom', from: '2026-10-01', to: '2026-11-09' },
                today
            ),
            today,
            'MONTHLY'
        );

        expect(
            buildUsageRows(
                tasks.slice(0, 1),
                'acmeCo/',
                statsOf({
                    'acmeCo/source-pg': {
                        '2026-10-01': [10, 100],
                        '2026-11-01': [5, 50],
                    },
                }),
                monthly.buckets,
                charges,
                '2026-11-02'
            )[0].costCents
        ).toBeCloseTo(((250 + 700) * 8) / 9);
    });

    test("a month's task and deleted-task costs add up to its charges", () => {
        const { buckets } = getBucketLayout(
            resolvePeriod({ preset: 'last' }, today),
            today
        );

        const rows = buildUsageRows(
            tasks,
            'acmeCo/',
            statsOf({
                'acmeCo/source-pg': { '2026-10-03': [30, 300] },
                'acmeCo/materialize-sf': { '2026-10-20': [50, 500] },
                'acmeCo/': {
                    '2026-10-03': [30, 300],
                    '2026-10-20': [70, 700],
                },
            }),
            buckets,
            charges
        );

        expect(rows.map(({ costCents }) => costCents)).toEqual([
            expect.closeTo(1500 + 4200),
            expect.closeTo(2500 + 7000),
            expect.closeTo(1000 + 2800),
        ]);
    });
});

describe('shareSegments', () => {
    const row = (name: string, gb: number) => ({
        name,
        kind: 'capture' as const,
        usage: [],
        costs: null,
        gb,
        hours: 0,
        costCents: null,
    });

    const rows = [
        row('a', 50),
        row('b', 30),
        row('c', 0),
        row('d', 15),
        row('e', 5),
    ];

    test('names the given tasks that used any, then everything else', () => {
        expect(shareSegments(rows, ['a', 'b', 'c'], 'gb')).toEqual({
            total: 100,
            segments: [
                { name: 'a', value: 50 },
                { name: 'b', value: 30 },
                { name: null, value: 20 },
            ],
        });
    });

    test('leaves out an everything-else too thin to see', () => {
        expect(
            shareSegments([row('a', 99999), row('b', 1)], ['a'], 'gb').segments
        ).toEqual([{ name: 'a', value: 99999 }]);
    });

    test('has nothing to split without usage', () => {
        expect(shareSegments([row('a', 0)], ['a'], 'costCents')).toEqual({
            total: 0,
            segments: [],
        });
    });

    test.each([
        [10, 100, '10%'],
        [0.5, 100, '<1%'],
        [0, 100, '0%'],
        [0, 0, '0%'],
    ])('%d of %d reads %s', (value, total, text) => {
        expect(formatShare(value, total)).toBe(text);
    });
});
