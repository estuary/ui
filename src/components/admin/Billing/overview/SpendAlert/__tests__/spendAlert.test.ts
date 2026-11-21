import type { SpendAlertState } from 'src/components/admin/Billing/overview/SpendAlert/shared';

import { describe, expect, test } from 'vitest';

import {
    getSpendAlertView,
    parseAmountCents,
} from 'src/components/admin/Billing/overview/SpendAlert/shared';
import {
    hasSpendAlertRecipients,
    readSpendAlert,
    withSpendAlert,
} from 'src/hooks/billing/useSpendAlert';

test.each([
    ['$2,500', 250000],
    ['2500.00', 250000],
    [' 2,500.5 ', 250050],
    ['19.99', 1999],
    ['.5', 50],
    ['', null],
    ['0', null],
    ['0.001', null],
    ['-5', null],
    ['1e3', null],
    ['twenty', null],
])('parseAmountCents(%j) is %j', (input, cents) => {
    expect(parseAmountCents(input)).toBe(cents);
});

describe('getSpendAlertView', () => {
    const set: SpendAlertState = {
        amountCents: 250000,
        enabled: true,
        chargesCents: 68240,
        hasRecipients: true,
        canEdit: true,
    };
    const reached = { ...set, chargesCents: 270000 };

    test('offers Set Up when no amount is on', () => {
        const notSet = {
            status: 'disabled',
            statusLabel: 'Disabled',
            line: "Get an email when this month's charges reach an amount you choose.",
            meter: null,
            action: 'Set Up',
            noRecipients: false,
        };

        expect(
            getSpendAlertView({ ...set, amountCents: null, enabled: false })
        ).toEqual(notSet);
        // A disabled alert keeps its amount, but reads as not set.
        expect(getSpendAlertView({ ...set, enabled: false })).toEqual(notSet);
    });

    test('meters charges against the amount', () => {
        expect(getSpendAlertView(set)).toEqual({
            status: 'enabled',
            statusLabel: 'Enabled',
            line: "Email when this month's charges reach $2,500.",
            meter: { text: '$682 of $2,500', percent: 27.296, reached: false },
            action: 'Edit',
            noRecipients: false,
        });
    });

    test('reports the alert that fired, at the amount it fired at', () => {
        expect(
            getSpendAlertView({
                ...reached,
                amountCents: 240050,
                firedAt: '2026-11-08T23:30:00Z',
                firedAmountCents: 250000,
            })
        ).toEqual({
            status: 'warning',
            statusLabel: 'Reached',
            line: 'Passed $2,500 on Nov 8. Recipients were emailed.',
            meter: { text: '$2,700 of $2,400.50', percent: 100, reached: true },
            action: 'Edit',
            noRecipients: false,
        });
    });

    test('says an email is coming when the alert has not fired yet', () => {
        expect(getSpendAlertView(reached).line).toBe(
            'Already past $2,500. Recipients get an email within the hour.'
        );
    });

    test('falls back to the open alert while charges are unknown', () => {
        const view = getSpendAlertView({
            ...set,
            chargesCents: null,
            firedAt: '2026-11-08T12:00:00Z',
        });

        expect(view.status).toBe('warning');
        expect(view.meter).toBeNull();
    });

    test('warns editors when no one is subscribed', () => {
        const view = getSpendAlertView({ ...reached, hasRecipients: false });

        expect(view.noRecipients).toBe(true);
        expect(view.line).toBe('Already past $2,500.');
    });

    test('shows view-only users the state without actions or warnings', () => {
        expect(
            getSpendAlertView({
                ...set,
                canEdit: false,
                hasRecipients: undefined,
            })
        ).toMatchObject({ action: null, noRecipients: false });
        expect(
            getSpendAlertView({ ...set, canEdit: false, enabled: false }).action
        ).toBeNull();
    });
});

describe('readSpendAlert', () => {
    test.each([
        [undefined, null, false],
        [{ taskIdle: { enabled: false } }, null, false],
        [{ billingThresholdExceeded: { enabled: true } }, null, false],
        [
            { billingThresholdExceeded: { condition: { usdCents: 500 } } },
            500,
            true,
        ],
        [
            {
                billingThresholdExceeded: {
                    enabled: false,
                    condition: { usdCents: 500 },
                },
            },
            500,
            false,
        ],
    ])('reads %j as %j, enabled %j', (config, amountCents, enabled) => {
        expect(readSpendAlert(config)).toEqual({ amountCents, enabled });
    });
});

test('withSpendAlert keeps the other settings in the row', () => {
    const alert = { enabled: true, condition: { usdCents: 250000 } };

    expect(
        withSpendAlert(
            {
                billingThresholdExceeded: { condition: { usdCents: 100 } },
                shardFailed: { condition: { failures: 5 } },
            },
            alert
        )
    ).toEqual({
        billingThresholdExceeded: alert,
        shardFailed: { condition: { failures: 5 } },
    });
    expect(withSpendAlert(undefined, alert)).toEqual({
        billingThresholdExceeded: alert,
    });
});

test('hasSpendAlertRecipients matches subscriptions the alert reaches', () => {
    const subscription = {
        alertTypes: ['billing_threshold_exceeded' as const],
        catalogPrefix: 'acme/',
        email: 'ops@acme.co',
    };
    const recipients = (overrides: Partial<typeof subscription>) =>
        hasSpendAlertRecipients([{ ...subscription, ...overrides }], 'acme/');

    expect(recipients({})).toBe(true);
    expect(recipients({ catalogPrefix: 'acme/alerts/' })).toBe(true);
    expect(recipients({ catalogPrefix: 'acme/prod/' })).toBe(false);
    expect(recipients({ alertTypes: [] })).toBe(false);
    expect(recipients({ email: '' })).toBe(false);
    expect(hasSpendAlertRecipients([], 'acme/')).toBe(false);
});
