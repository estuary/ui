import { describe, expect, test } from 'vitest';

import {
    daysBetween,
    formatCents,
    formatDate,
    formatDay,
    formatGb,
    formatHours,
    formatMonth,
    formatMonthToDate,
    formatQuantity,
    formatQuantityRange,
    formatRate,
    formatWholeCents,
    nextMonthStart,
    previousMonthEnd,
} from 'src/components/admin/Billing/shared/format';

describe('money', () => {
    test.each([
        [56660, '$566.60'],
        [-11500, '−$115.00'],
        [0, '$0.00'],
        [123456789, '$1,234,567.89'],
    ])('formatCents(%d) is %s', (cents, text) => {
        expect(formatCents(cents)).toBe(text);
    });

    test.each([
        [201749, '$2,017'],
        [-3122, '−$31'],
        [-40, '$0'],
        [250000, '$2,500'],
    ])('formatWholeCents(%d) is %s', (cents, text) => {
        expect(formatWholeCents(cents)).toBe(text);
    });

    test.each([
        [50, 'data', '$0.50/GB'],
        [14, 'hours', '$0.14/h'],
    ] as const)('formatRate(%d, %s) is %s', (cents, kind, text) => {
        expect(formatRate(cents, kind)).toBe(text);
    });
});

describe('usage', () => {
    test.each([
        [2.6, '2.6 GB'],
        [24.63, '24.6 GB'],
        [820.4, '820 GB'],
        [2960, '2,960 GB'],
        [12345, '12.3 TB'],
    ])('formatGb(%d) is %s', (gb, text) => {
        expect(formatGb(gb)).toBe(text);
    });

    test('formatHours rounds to whole hours', () => {
        expect(formatHours(1940.4)).toBe('1,940 h');
    });

    test.each([
        [1000, 'data', '1 TB'],
        [1024, 'data', '1,024 GB'],
        [4464, 'hours', '4,464 task hours'],
    ] as const)('formatQuantity(%d, %s) is %s', (value, kind, text) => {
        expect(formatQuantity(value, kind)).toBe(text);
    });

    test.each([
        [1000, 5000, 'data', '1 – 5 TB'],
        [1024, 5000, 'data', '1,024 – 5,000 GB'],
        [4464, 13392, 'hours', '4,464 – 13,392 task hours'],
    ] as const)(
        'formatQuantityRange(%d, %d, %s) is %s',
        (from, to, kind, text) => {
            expect(formatQuantityRange(from, to, kind)).toBe(text);
        }
    );
});

describe('dates', () => {
    test('read billing dates as UTC calendar days', () => {
        expect(formatDay('2026-11-01')).toBe('Nov 1');
        expect(formatDate('2026-10-15')).toBe('Oct 15, 2026');
        expect(formatMonth('2026-11-01')).toBe('November 2026');
    });

    test.each([
        ['2026-11-09', 'Nov 1 – 9'],
        ['2026-11-01', 'Nov 1'],
    ])('the month to %s is %s', (today, text) => {
        expect(formatMonthToDate(today)).toBe(text);
    });

    test.each([
        ['2026-11-09', '2026-12-01', '2026-10-31'],
        ['2026-12-31', '2027-01-01', '2026-11-30'],
        ['2027-01-01', '2027-02-01', '2026-12-31'],
        ['2028-03-15', '2028-04-01', '2028-02-29'],
    ])(
        'on %s the next month starts %s and the last one ended %s',
        (date, next, previous) => {
            expect(nextMonthStart(date)).toBe(next);
            expect(previousMonthEnd(date)).toBe(previous);
        }
    );

    test('counts whole days between dates', () => {
        expect(daysBetween('2026-11-09', '2026-11-21')).toBe(12);
        expect(daysBetween('2026-10-25', '2026-11-03')).toBe(9);
    });
});
