import type { TaskUsageRow } from 'src/components/admin/Billing/usage/rows';

import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';

import {
    countCsvRows,
    toCsvRows,
} from 'src/components/admin/Billing/usage/csv';
import {
    getBucketLayout,
    resolvePeriod,
} from 'src/components/admin/Billing/usage/period';
import { DELETED_TASKS } from 'src/components/admin/Billing/usage/rows';

const GB = 1e9;
const HOUR = 3600;

const today = DateTime.utc(2026, 11, 2);

// Oct 31 to Nov 2 by day.
const { buckets } = getBucketLayout(
    resolvePeriod(
        { preset: 'custom', from: '2026-10-31', to: '2026-11-02' },
        today
    ),
    today
);

const row = (name: string, gbByDay: number[]): TaskUsageRow => ({
    name,
    kind: name === DELETED_TASKS ? null : 'capture',
    usage: gbByDay.map((gb) => ({ bytes: gb * GB, seconds: 24 * HOUR })),
    costs: gbByDay.map((gb) => gb * 50),
    gb: 0,
    hours: 0,
    costCents: 0,
});

const rows = [
    row(DELETED_TASKS, [0.5, 0, 0]),
    row('acmeCo/zendesk', [1, 2, 3]),
    row('acmeCo/postgres', [0.0004, 1.2346, 0]),
];

describe('toCsvRows', () => {
    test('writes a row per task per day, by name, deleted tasks last', () => {
        expect(
            toCsvRows(rows, buckets, 'day', ['gb', 'hours', 'cost'])
        ).toEqual([
            ['2026-10-31', 'acmeCo/postgres', '0.000', '24.00', '0.00'],
            ['2026-10-31', 'acmeCo/zendesk', '1.000', '24.00', '0.50'],
            ['2026-10-31', DELETED_TASKS, '0.500', '24.00', '0.25'],
            ['2026-11-01', 'acmeCo/postgres', '1.235', '24.00', '0.62'],
            ['2026-11-01', 'acmeCo/zendesk', '2.000', '24.00', '1.00'],
            ['2026-11-01', DELETED_TASKS, '0.000', '24.00', '0.00'],
            ['2026-11-02', 'acmeCo/postgres', '0.000', '24.00', '0.00'],
            ['2026-11-02', 'acmeCo/zendesk', '3.000', '24.00', '1.50'],
            ['2026-11-02', DELETED_TASKS, '0.000', '24.00', '0.00'],
        ]);
    });

    test('sums days into months, keeping only the chosen columns', () => {
        expect(toCsvRows(rows, buckets, 'month', ['hours'])).toEqual([
            ['2026-10', 'acmeCo/postgres', '24.00'],
            ['2026-10', 'acmeCo/zendesk', '24.00'],
            ['2026-10', DELETED_TASKS, '24.00'],
            ['2026-11', 'acmeCo/postgres', '48.00'],
            ['2026-11', 'acmeCo/zendesk', '48.00'],
            ['2026-11', DELETED_TASKS, '48.00'],
        ]);
    });

    test('stops at a limit, for the preview', () => {
        expect(toCsvRows(rows, buckets, 'day', ['gb'], 4)).toHaveLength(4);
    });

    test('counts every row without building them', () => {
        expect(countCsvRows(rows, buckets, 'day')).toBe(9);
        expect(countCsvRows(rows, buckets, 'month')).toBe(6);
    });

    test('skips days still to come', () => {
        const thisMonth = getBucketLayout(
            resolvePeriod({ preset: 'this' }, today),
            today
        );
        const partial = [row('acmeCo/zendesk', [1, 2])].map((task) => ({
            ...task,
            usage: [...task.usage, ...Array(28).fill(null)],
        }));

        expect(
            toCsvRows(partial, thisMonth.buckets, 'day', ['gb']).map(
                ([date]) => date
            )
        ).toEqual(['2026-11-01', '2026-11-02']);
    });
});
