import type { InvoiceLineItem } from 'src/api/gql/billing';

import { describe, expect, test } from 'vitest';

import {
    creditCents,
    invoiceLines,
    lineItemKind,
    sumCents,
} from 'src/components/admin/Billing/shared/lineItems';

const item = (
    description: string | null,
    subtotal: number,
    count = 1,
    rate = subtotal
): InvoiceLineItem => ({ description, count, rate, subtotal });

// A contract's month, as billing describes it.
const contract = [
    item('Recurring service charge', 150000),
    item('Data processing (first 1024 GBs at $0.00/GB)', 0, 1024, 0),
    item('Data processing (at $0.50/GB)', 48350, 967, 50),
    item('Task usage (first 1440 hours at $0.00/hour)', 0, 1440, 0),
    item('Task usage (next 1440 hours at $0.14/hour)', 20160, 1440, 14),
    item('Task usage (at $0.07/hour)', 0, 0, 7),
    item('Task hours during the Nov 4 incident', -1960),
    item(null, -500),
];

// A self-serve month that began in the free tier and moved into a trial.
const selfServe = [
    item('Data processing (at $0.50/GB)', 1600, 32, 50),
    item('Task usage (first 4464 hours at $0.14/hour)', 30954, 2211, 14),
    item('Task usage (at $0.07/hour)', 0, 0, 7),
    item('Free trial credit (2026-11-11 - 2026-12-10)', -25176),
    item('Free tier credit ending 2026-11-10', -7378),
];

describe('lineItemKind', () => {
    test.each([
        ['Recurring service charge', 'recurring'],
        ['Data processing (first 5 GBs at $0.50/GB)', 'data'],
        ['Data processing (next 10 GBs at $0.40/GB)', 'data'],
        ['Data processing (at $0.50/GB)', 'data'],
        ['Task usage (first 4464 hours at $0.14/hour)', 'hours'],
        ['Task usage (at $0.07/hour)', 'hours'],
        ['Free trial credit (2026-10-11 - 2026-11-10)', 'trial'],
        ['Free tier credit', 'freeTier'],
        ['Free tier credit ending 2026-10-10', 'freeTier'],
        ['Data processing refund for the Oct 15 outage', 'adjustment'],
        [null, 'adjustment'],
    ])('%s is %s', (description, kind) => {
        expect(lineItemKind(description)).toBe(kind);
    });
});

test('sums line items by kind and counts negative lines as credits', () => {
    expect(sumCents(contract, 'data')).toBe(48350);
    expect(sumCents(contract, 'hours')).toBe(20160);
    expect(sumCents(selfServe, 'trial')).toBe(-25176);
    expect(creditCents(contract)).toBe(-2460);
    expect(creditCents(selfServe)).toBe(-32554);
});

describe('invoiceLines', () => {
    test("names each tier's range and moves its rate to the quantity", () => {
        expect(invoiceLines(contract)).toMatchInlineSnapshot(`
          [
            {
              "cents": 150000,
              "description": "Recurring service charge",
              "quantity": null,
            },
            {
              "cents": 0,
              "description": "Data processing, included",
              "quantity": "1,024 GB",
            },
            {
              "cents": 48350,
              "description": "Data processing, over 1,024 GB",
              "quantity": "967 GB × $0.50/GB",
            },
            {
              "cents": 0,
              "description": "Task usage, included",
              "quantity": "1,440 h",
            },
            {
              "cents": 20160,
              "description": "Task usage, 1,440 – 2,880 task hours",
              "quantity": "1,440 h × $0.14/h",
            },
            {
              "cents": -1960,
              "description": "Credit: Task hours during the Nov 4 incident",
              "quantity": null,
            },
            {
              "cents": -500,
              "description": "Credit",
              "quantity": null,
            },
          ]
        `);
    });

    test('drops unused tiers and empty credits', () => {
        expect(
            invoiceLines([
                ...selfServe,
                item('Free tier credit', 0),
                item('Free trial credit (2026-11-11 - 2026-12-10)', 0),
            ])
        ).toMatchInlineSnapshot(`
          [
            {
              "cents": 1600,
              "description": "Data processing",
              "quantity": "32 GB × $0.50/GB",
            },
            {
              "cents": 30954,
              "description": "Task usage, first 4,464 task hours",
              "quantity": "2,211 h × $0.14/h",
            },
            {
              "cents": -25176,
              "description": "Free trial credit",
              "quantity": null,
            },
            {
              "cents": -7378,
              "description": "Free tier credit",
              "quantity": null,
            },
          ]
        `);
    });
});
