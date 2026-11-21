import { describe, expect, test } from 'vitest';

import { toMonthCharges } from 'src/hooks/billing/useTaskUsageCharges';

const lineItems = [
    { description: 'Recurring service charge', subtotal: 250000 },
    {
        description: 'Data processing (first 1000 GBs at $0.50/GB)',
        subtotal: 50000,
    },
    {
        description: 'Data processing (next 3000 GBs at $0.40/GB)',
        subtotal: 12000,
    },
    {
        description: 'Task usage (first 4464 hours at $0.14/hour)',
        subtotal: 62496,
    },
    { description: 'Task usage (at $0.07/hour)', subtotal: 700 },
    {
        description: 'Free trial credit (2026-10-11 - 2026-11-10)',
        subtotal: -100,
    },
    { description: null, subtotal: -500 },
];

const invoice = (
    dateStart: string,
    invoiceType: 'PREVIEW' | 'FINAL' | 'MANUAL',
    gb: number
) => ({
    dateStart,
    invoiceType,
    lineItems,
    extra:
        invoiceType === 'MANUAL'
            ? null
            : { processed_data_gb: gb, task_usage_hours: 4564 },
});

describe('toMonthCharges', () => {
    test("sums each month's data and task line items, leaving out credits", () => {
        expect(
            toMonthCharges([invoice('2026-11-01', 'PREVIEW', 1300)])
        ).toEqual({
            '2026-11': {
                dataCents: 62000,
                taskCents: 63196,
                gb: 1300,
                hours: 4564,
            },
        });
    });

    test.each([
        ['after', ['PREVIEW', 'FINAL']],
        ['before', ['FINAL', 'PREVIEW']],
    ] as const)('takes the FINAL listed %s a PREVIEW', (_, types) => {
        const charges = toMonthCharges([
            invoice('2026-10-01', types[0], types[0] === 'FINAL' ? 2 : 1),
            invoice('2026-10-01', types[1], types[1] === 'FINAL' ? 2 : 1),
        ]);

        expect(charges['2026-10'].gb).toBe(2);
    });

    test('skips one-time invoices', () => {
        expect(toMonthCharges([invoice('2026-10-15', 'MANUAL', 0)])).toEqual(
            {}
        );
    });
});
