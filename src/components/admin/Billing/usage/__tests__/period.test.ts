import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';

import {
    formatBucketLong,
    formatRange,
    getBucketLayout,
    getStatsWindow,
    isoDay,
    resolvePeriod,
    selectRange,
} from 'src/components/admin/Billing/usage/period';

const today = DateTime.utc(2026, 11, 9);
const day = (date: string) => DateTime.fromISO(date, { zone: 'utc' });

const range = ({ from, to }: { from: DateTime; to: DateTime }) => [
    isoDay(from),
    isoDay(to),
];

describe('resolvePeriod', () => {
    test.each([
        ['this', '2026-11-01', '2026-11-09'],
        ['last', '2026-10-01', '2026-10-31'],
        ['three', '2026-09-01', '2026-11-09'],
        ['six', '2026-06-01', '2026-11-09'],
        ['twelve', '2025-12-01', '2026-11-09'],
    ] as const)('%s runs from %s to %s', (preset, from, to) => {
        expect(range(resolvePeriod({ preset }, today))).toEqual([from, to]);
    });

    test('a custom range keeps its days', () => {
        expect(
            range(
                resolvePeriod(
                    { preset: 'custom', from: '2026-10-15', to: '2026-11-03' },
                    today
                )
            )
        ).toEqual(['2026-10-15', '2026-11-03']);
    });
});

describe('selectRange', () => {
    test.each([
        ['2026-11-01', '2026-11-09', { preset: 'this' }],
        ['2026-10-01', '2026-10-31', { preset: 'last' }],
        [
            '2026-10-15',
            '2026-11-03',
            { preset: 'custom', from: '2026-10-15', to: '2026-11-03' },
        ],
        // Picked end first.
        [
            '2026-11-03',
            '2026-10-15',
            { preset: 'custom', from: '2026-10-15', to: '2026-11-03' },
        ],
        // 92 days stay daily.
        [
            '2026-08-01',
            '2026-10-31',
            { preset: 'custom', from: '2026-08-01', to: '2026-10-31' },
        ],
        // Longer widens to whole months.
        [
            '2026-03-15',
            '2026-08-10',
            { preset: 'custom', from: '2026-03-01', to: '2026-08-31' },
        ],
        // ...which may land on a preset, ending today rather than Nov 30.
        ['2026-06-15', '2026-11-05', { preset: 'six' }],
        // No further back than the twelve months the tab reads.
        ['2025-06-15', '2026-11-05', { preset: 'twelve' }],
    ])('%s to %s selects %j', (from, to, selection) => {
        expect(selectRange(day(from), day(to), today)).toEqual(selection);
    });
});

describe('getBucketLayout', () => {
    const layout = (selection: Parameters<typeof resolvePeriod>[0]) =>
        getBucketLayout(resolvePeriod(selection, today), today);

    test('this month has a bucket for every day, the rest still to come', () => {
        const { grain, buckets } = layout({ preset: 'this' });

        expect(grain).toBe('DAILY');
        expect(buckets).toHaveLength(30);
        expect(buckets.filter(({ future }) => future)).toHaveLength(21);
        expect(buckets[8]).toMatchObject({ key: '2026-11-09', future: false });
        expect(buckets[9]).toMatchObject({ key: '2026-11-10', future: true });
    });

    test('three months still go by day', () => {
        const { grain, buckets } = layout({ preset: 'three' });

        expect(grain).toBe('DAILY');
        expect(buckets).toHaveLength(70);
        expect(buckets.some(({ future }) => future)).toBe(false);
    });

    test('twelve months go by month, the current one cut at today', () => {
        const { grain, buckets } = layout({ preset: 'twelve' });

        expect(grain).toBe('MONTHLY');
        expect(buckets.map(({ key }) => key)).toEqual([
            '2025-12-01',
            '2026-01-01',
            '2026-02-01',
            '2026-03-01',
            '2026-04-01',
            '2026-05-01',
            '2026-06-01',
            '2026-07-01',
            '2026-08-01',
            '2026-09-01',
            '2026-10-01',
            '2026-11-01',
        ]);
        expect(isoDay(buckets[10].end)).toBe('2026-10-31');
        expect(isoDay(buckets[11].end)).toBe('2026-11-09');
    });

    test('a bucket per day up to 92 days, per month past that', () => {
        expect(
            layout({ preset: 'custom', from: '2026-08-01', to: '2026-10-31' })
                .grain
        ).toBe('DAILY');
        expect(
            layout({ preset: 'custom', from: '2026-07-01', to: '2026-10-31' })
                .grain
        ).toBe('MONTHLY');
    });
});

describe('getStatsWindow', () => {
    test('a daily window ends the day after the period', () => {
        const window = getStatsWindow(
            resolvePeriod({ preset: 'this' }, today),
            'DAILY'
        );

        expect(range({ from: window.start, to: window.end })).toEqual([
            '2026-11-01',
            '2026-11-10',
        ]);
    });

    test('a monthly window covers whole months', () => {
        const window = getStatsWindow(
            resolvePeriod({ preset: 'twelve' }, today),
            'MONTHLY'
        );

        expect(range({ from: window.start, to: window.end })).toEqual([
            '2025-12-01',
            '2026-12-01',
        ]);
    });
});

describe('formatting', () => {
    test.each([
        ['2026-11-09', '2026-11-09', 'Nov 9, 2026'],
        ['2026-11-01', '2026-11-09', 'Nov 1 – 9, 2026'],
        ['2026-09-01', '2026-11-09', 'Sep 1 – Nov 9, 2026'],
        ['2025-12-01', '2026-11-09', 'Dec 1, 2025 – Nov 9, 2026'],
    ])('%s to %s reads %s', (from, to, text) => {
        expect(formatRange(day(from), day(to))).toBe(text);
    });

    test('a month names itself once over, its days until then', () => {
        const { buckets } = getBucketLayout(
            resolvePeriod({ preset: 'twelve' }, today),
            today
        );

        expect(formatBucketLong(buckets[10], 'MONTHLY')).toBe('October 2026');
        expect(formatBucketLong(buckets[11], 'MONTHLY')).toBe(
            'Nov 1 – 9, 2026'
        );
    });
});
