import type { Invoice } from 'src/api/gql/billing';

import { describe, expect, test } from 'vitest';

import {
    invoiceFootnote,
    invoiceStatus,
    invoiceSubtitle,
    invoiceTitle,
} from 'src/components/admin/Billing/overview/invoiceRows';

const invoice = (overrides: Partial<Invoice> = {}): Invoice => ({
    __typename: 'Invoice',
    dateStart: '2026-10-01',
    dateEnd: '2026-10-31',
    invoiceType: 'FINAL',
    subtotal: 224566,
    lineItems: [
        {
            description: 'Data processing (at $0.50/GB)',
            count: 2960,
            rate: 50,
            subtotal: 148000,
        },
        {
            description: 'Task hours during the Oct 15-16 outage',
            count: 1,
            rate: -3122,
            subtotal: -3122,
        },
    ],
    extra: { processed_data_gb: 2960.2, task_usage_hours: 6920.4 },
    status: 'paid',
    invoicePdf: null,
    hostedInvoiceUrl: null,
    ...overrides,
});

const charged = { internal: false, sendInvoice: false };
const emailed = { internal: false, sendInvoice: true };

describe('invoiceStatus', () => {
    test.each([
        [
            'this month',
            invoice({ invoiceType: 'PREVIEW' }),
            charged,
            'In progress',
        ],
        [
            'an internal tenant',
            invoice(),
            { ...charged, internal: true },
            'Not billed',
        ],
        ['nothing to pay', invoice({ subtotal: 0 }), charged, 'No charge'],
        ['a paid invoice', invoice(), charged, 'Paid'],
        ['an open charge', invoice({ status: 'open' }), charged, 'Due'],
        ['an emailed invoice', invoice({ status: 'open' }), emailed, 'Sent'],
        ['a void invoice', invoice({ status: 'void' }), charged, 'Void'],
        ['a marketplace bill', invoice({ status: null }), charged, 'Issued'],
        [
            'a one-time bill without a Stripe invoice',
            invoice({ invoiceType: 'MANUAL', status: null }),
            charged,
            undefined,
        ],
    ] as const)('labels %s', (_case, value, context, label) => {
        expect(invoiceStatus(value, context)?.label).toBe(label);
    });
});

test('titles usage invoices by month and manual ones by their first line', () => {
    expect(invoiceTitle(invoice())).toBe('October 2026');
    const manual = invoice({
        invoiceType: 'MANUAL',
        dateStart: '2026-10-15',
        dateEnd: '2026-10-15',
        lineItems: [
            {
                description: 'Onboarding and migration services',
                count: 1,
                rate: 600000,
                subtotal: 600000,
            },
        ],
        extra: null,
    });
    expect(invoiceTitle(manual)).toBe('Onboarding and migration services');
    expect(invoiceSubtitle(manual, '2026-11-09')).toBe(
        'One-time · Oct 15, 2026'
    );
    expect(invoiceFootnote(manual)).toBe('Issued Oct 15, 2026');
});

test('shows how far into the month its preview runs', () => {
    const preview = invoice({
        invoiceType: 'PREVIEW',
        dateStart: '2026-11-01',
        dateEnd: '2026-11-30',
    });

    expect(invoiceSubtitle(preview, '2026-11-09')).toBe('Nov 1 – 9');
    // Issued only once the month is over.
    expect(invoiceFootnote(preview)).toBe(
        '2,960 GB · 6,920 task hours · −$31.22 credits'
    );
    // Last month's preview, before it's frozen, has no subtitle.
    expect(invoiceSubtitle(preview, '2026-12-02')).toBeNull();
    expect(invoiceSubtitle(invoice(), '2026-11-09')).toBeNull();
});

test("footnotes a usage invoice's issue date, usage and credits", () => {
    expect(invoiceFootnote(invoice())).toBe(
        'Issued Nov 1, 2026 · 2,960 GB · 6,920 task hours · −$31.22 credits'
    );
});
