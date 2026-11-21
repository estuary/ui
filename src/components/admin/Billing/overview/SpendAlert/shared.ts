import type { StatusPillVariant } from 'src/components/shared/StatusPill';

import {
    formatCents,
    formatDay,
    formatWholeCents,
} from 'src/components/admin/Billing/shared/format';

// Whole dollars, unless the amount has cents.
const formatAmount = (cents: number) =>
    cents % 100 === 0 ? formatWholeCents(cents) : formatCents(cents);

// Rounded down, so charges just under the amount never read as reaching it.
export const formatCharges = (cents: number) =>
    formatWholeCents(Math.floor(cents / 100) * 100);

// Accepts entries like "$2,500" or "2500.00". Returns null unless the amount
// is above zero, which the server requires.
export function parseAmountCents(input: string): number | null {
    const value = input.replace(/[$,\s]/g, '');
    if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) {
        return null;
    }

    const cents = Math.round(Number(value) * 100);

    return cents > 0 ? cents : null;
}

export interface SpendAlertState {
    amountCents: number | null;
    enabled: boolean;
    chargesCents: number | null;
    firedAt?: string;
    firedAmountCents?: number;
    hasRecipients?: boolean;
    canEdit: boolean;
}

export interface SpendAlertView {
    status: StatusPillVariant;
    statusLabel: string;
    line: string;
    meter: { text: string; percent: number; reached: boolean } | null;
    // The edit button's label, or null to show "Admins only" instead.
    action: 'Set Up' | 'Edit' | null;
    noRecipients: boolean;
}

export function getSpendAlertView({
    amountCents,
    enabled,
    chargesCents,
    firedAt,
    firedAmountCents,
    hasRecipients,
    canEdit,
}: SpendAlertState): SpendAlertView {
    if (!enabled || amountCents === null) {
        return {
            status: 'disabled',
            statusLabel: 'Disabled',
            line: "Get an email when this month's charges reach an amount you choose.",
            meter: null,
            action: canEdit ? 'Set Up' : null,
            noRecipients: false,
        };
    }

    // The backend compares the same charges, so they decide. Until they load,
    // an open alert still means the amount was reached.
    const reached =
        chargesCents === null ? Boolean(firedAt) : chargesCents >= amountCents;
    const emailed = hasRecipients !== false;

    let line = `Email when this month's charges reach ${formatAmount(amountCents)}.`;
    if (reached && firedAt) {
        // The open alert keeps the amount it fired at, which is what its
        // email said, even if the amount changed since.
        line = `Passed ${formatAmount(firedAmountCents ?? amountCents)} on ${formatDay(new Date(firedAt).toISOString())}.`;
        if (emailed) {
            line += ' Recipients were emailed.';
        }
    } else if (reached) {
        // Saving an amount that is already passed wakes the alert check, so
        // this shows until the alert fires.
        line = `Already past ${formatAmount(amountCents)}.`;
        if (emailed) {
            line += ' Recipients get an email within the hour.';
        }
    }

    return {
        status: reached ? 'warning' : 'enabled',
        statusLabel: reached ? 'Reached' : 'Enabled',
        line,
        meter:
            chargesCents === null
                ? null
                : {
                      text: `${formatCharges(chargesCents)} of ${formatAmount(amountCents)}`,
                      percent: Math.min(
                          100,
                          Math.max(1, (chargesCents / amountCents) * 100)
                      ),
                      reached,
                  },
        action: canEdit ? 'Edit' : null,
        noRecipients: canEdit && hasRecipients === false,
    };
}
