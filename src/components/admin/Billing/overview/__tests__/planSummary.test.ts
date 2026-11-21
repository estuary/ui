import type { BillingPlan } from 'src/api/gql/billing';

import { describe, expect, test } from 'vitest';

import {
    planChips,
    planName,
    planSentence,
} from 'src/components/admin/Billing/overview/planSummary';

const today = '2026-11-09';

const tiers = {
    dataTiers: [{ rateCents: 50, quantity: null }],
    usageTiers: [
        { rateCents: 14, quantity: 4464 },
        { rateCents: 7, quantity: null },
    ],
};

const selfServe = (
    phase: 'FREE' | 'TRIAL' | 'PAID',
    collectionMethod:
        | 'CHARGE_DEFAULT_PAYMENT_METHOD'
        | 'SEND_INVOICE' = 'CHARGE_DEFAULT_PAYMENT_METHOD'
): BillingPlan => ({
    __typename: 'SelfServePlan',
    phase,
    collectionMethod,
    trial: phase === 'FREE' ? null : { start: '2026-10-22', end: '2026-11-21' },
    ...tiers,
});

const contract = (
    paymentProvider: 'STRIPE' | 'AWS_MARKETPLACE' = 'STRIPE',
    collectionMethod:
        | 'CHARGE_DEFAULT_PAYMENT_METHOD'
        | 'SEND_INVOICE' = 'SEND_INVOICE'
): BillingPlan => ({
    __typename: 'ContractPlan',
    paymentProvider,
    collectionMethod,
    dataTiers: [
        { rateCents: 0, quantity: 1024 },
        { rateCents: 50, quantity: null },
    ],
    usageTiers: [
        { rateCents: 0, quantity: 1440 },
        { rateCents: 14, quantity: null },
    ],
});

const internal: BillingPlan = { __typename: 'InternalPlan' };

test.each([
    [selfServe('FREE'), 'Free tier', []],
    [
        selfServe('TRIAL'),
        'Free trial',
        [{ label: '12 days left', color: 'info' }],
    ],
    [selfServe('PAID'), 'Cloud', []],
    [contract(), 'Contract', []],
    [
        contract('AWS_MARKETPLACE'),
        'Contract',
        [{ label: 'AWS Marketplace', color: 'default' }],
    ],
    [internal, 'Internal', []],
])('names the plan and its chips (%#)', (plan, name, chips) => {
    expect(planName(plan)).toBe(name);
    expect(planChips(plan, today)).toEqual(chips);
});

describe('planSentence', () => {
    test.each([
        [
            'the free tier',
            { plan: selfServe('FREE') },
            'Up to 2 tasks and 10 GB of data a month, free. No card needed.',
        ],
        [
            'a trial',
            { plan: selfServe('TRIAL') },
            "Usage is free until Nov 21. After that it's billed monthly at the rates below.",
        ],
        [
            'a card',
            {
                plan: selfServe('PAID'),
                projectedSubtotalCents: 201749,
                paymentMethod: 'Visa ending 4242',
            },
            'Your next invoice is about $2,017 on Dec 1, charged to Visa ending 4242.',
        ],
        [
            'emailed invoices',
            {
                plan: selfServe('PAID', 'SEND_INVOICE'),
                projectedSubtotalCents: 201749,
                contactEmail: 'ap@acme.co',
            },
            'Your next invoice is about $2,017 on Dec 1, emailed to ap@acme.co.',
        ],
        [
            'a projection that failed to load',
            {
                plan: selfServe('PAID'),
                paymentMethod: 'Visa ending 4242',
            },
            'Your next invoice is on Dec 1, charged to Visa ending 4242.',
        ],
        [
            'a contract',
            {
                plan: contract(),
                projectedSubtotalCents: 402800,
                recurringFeeCents: 250000,
            },
            '$2,500 a month with 1,024 GB of data and 1,440 task hours included. Overage is about $1,528 this month, invoiced Dec 1.',
        ],
        [
            'a contract within its included usage',
            {
                plan: contract('STRIPE', 'CHARGE_DEFAULT_PAYMENT_METHOD'),
                projectedSubtotalCents: 250000,
                recurringFeeCents: 250000,
            },
            '$2,500 a month with 1,024 GB of data and 1,440 task hours included. Overage is about $0 this month, charged Dec 1.',
        ],
        [
            'a contract whose preview invoice failed to load',
            { plan: contract(), projectedSubtotalCents: 520000 },
            '1,024 GB of data and 1,440 task hours included each month. Overage is invoiced Dec 1.',
        ],
        [
            'a marketplace contract',
            { plan: contract('AWS_MARKETPLACE') },
            'Billed through AWS Marketplace, with 1,024 GB of data and 1,440 task hours included each month. Overage is invoiced by Estuary.',
        ],
        [
            'an internal tenant',
            { plan: internal },
            'Internal Estuary tenant. Usage is recorded but not billed.',
        ],
    ])('describes %s', (_case, input, sentence) => {
        expect(planSentence({ today, ...input })).toBe(sentence);
    });
});
