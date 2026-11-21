import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';

import {
    batchStatsNames,
    countWindowBuckets,
} from 'src/hooks/billing/useTaskUsageStats';

const names = (count: number) =>
    Array.from({ length: count }, (_, index) => `acmeCo/task-${index}`);

describe('batchStatsNames', () => {
    test.each([
        // A year by month: the name cap binds.
        [151, 12, [100, 51]],
        // 92 days by day still fit 100 names under 10,000 buckets.
        [151, 92, [100, 51]],
        // A year by day: the bucket cap binds at 27 names.
        [151, 366, [27, 27, 27, 27, 27, 16]],
        [3, 12, [3]],
        [0, 12, []],
    ])(
        '%d names of %d buckets go in batches of %j',
        (count, buckets, sizes) => {
            const batches = batchStatsNames(names(count), buckets);

            expect(batches.map((batch) => batch.length)).toEqual(sizes);
            batches.forEach((batch) => {
                expect(batch.length).toBeLessThanOrEqual(100);
                expect(batch.length * buckets).toBeLessThanOrEqual(10_000);
            });
        }
    );

    test('keeps every name once, in order', () => {
        expect(batchStatsNames(names(250), 30).flat()).toEqual(names(250));
    });
});

describe('countWindowBuckets', () => {
    test.each([
        ['DAILY', '2026-11-01', '2026-11-10', 9],
        ['DAILY', '2025-11-09', '2026-11-10', 366],
        ['MONTHLY', '2025-12-01', '2026-12-01', 12],
    ] as const)('%s from %s to %s has %d', (grain, start, end, count) => {
        expect(
            countWindowBuckets({
                grain,
                start: DateTime.fromISO(start, { zone: 'utc' }),
                end: DateTime.fromISO(end, { zone: 'utc' }),
            })
        ).toBe(count);
    });
});
