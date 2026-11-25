import type { InvoiceLineItem } from 'src/api/gql/billing';
import type { UsageKind } from 'src/components/admin/Billing/shared/format';

import {
    formatNumber,
    formatQuantity,
    formatQuantityRange,
    formatRate,
} from 'src/components/admin/Billing/shared/format';

export type LineItemKind =
    | UsageKind
    | 'recurring'
    | 'trial'
    | 'freeTier'
    | 'adjustment';

// Billing describes each usage tier like "Task usage (first 4464 hours at
// $0.14/hour)", "Data processing (next 10 GBs at $0.40/GB)" or "Data
// processing (at $0.50/GB)" for the open last tier.
const USAGE_TIER =
    /^(Data processing|Task usage) \((?:(?:first|next) (\d+) \S+ )?at /;

export const USAGE_NAMES: Record<UsageKind, string> = {
    data: 'Data processing',
    hours: 'Task usage',
};

const usageTier = (description: string | null) => {
    const match = description?.match(USAGE_TIER);

    return match
        ? {
              kind: (match[1] === USAGE_NAMES.data
                  ? 'data'
                  : 'hours') as UsageKind,
              width: match[2] ? Number(match[2]) : null,
          }
        : null;
};

// Adjustments carry free text, or no description at all.
export const lineItemKind = (description: string | null): LineItemKind => {
    if (description === 'Recurring service charge') {
        return 'recurring';
    }

    if (description?.startsWith('Free trial credit')) {
        return 'trial';
    }

    if (description?.startsWith('Free tier credit')) {
        return 'freeTier';
    }

    return usageTier(description)?.kind ?? 'adjustment';
};

export const sumCents = (lineItems: InvoiceLineItem[], kind: LineItemKind) =>
    lineItems
        .filter(({ description }) => lineItemKind(description) === kind)
        .reduce((total, { subtotal }) => total + subtotal, 0);

// The free tier, the trial and billing credits are the negative lines.
export const creditCents = (lineItems: InvoiceLineItem[]) =>
    lineItems
        .filter(({ subtotal }) => subtotal < 0)
        .reduce((total, { subtotal }) => total + subtotal, 0);

export const adjustmentDescription = ({
    description,
    subtotal,
}: InvoiceLineItem) => description ?? (subtotal < 0 ? 'Credit' : 'Charge');

export interface InvoiceLine {
    description: string;
    quantity: string | null;
    cents: number;
}

const tierDescription = (
    kind: UsageKind,
    from: number,
    width: number | null,
    rateCents: number
) => {
    const name = USAGE_NAMES[kind];

    if (rateCents === 0) {
        return `${name}, included`;
    }

    if (width === null) {
        return from === 0
            ? name
            : `${name}, over ${formatQuantity(from, kind)}`;
    }

    return from === 0
        ? `${name}, first ${formatQuantity(width, kind)}`
        : `${name}, ${formatQuantityRange(from, from + width, kind)}`;
};

// An invoice's lines as the page shows them: each usage tier names its range
// and moves its rate into the quantity, and unused tiers and empty credits
// are left out. Unpriced lines, as for tenants that aren't billed, cost
// nothing and have no rate.
export function invoiceLines(
    lineItems: InvoiceLineItem[],
    unpriced = false
): InvoiceLine[] {
    // Tiers follow each other, so each one starts where the last one ended.
    const tierStart: Record<UsageKind, number> = { data: 0, hours: 0 };

    return lineItems.flatMap((item): InvoiceLine[] => {
        const tier = usageTier(item.description);

        if (tier) {
            const from = tierStart[tier.kind];
            tierStart[tier.kind] += tier.width ?? 0;

            if (item.count === 0) {
                return [];
            }

            const count = `${formatNumber(item.count)} ${tier.kind === 'data' ? 'GB' : 'h'}`;

            return [
                {
                    description: tierDescription(
                        tier.kind,
                        from,
                        tier.width,
                        item.rate
                    ),
                    quantity:
                        item.rate === 0 || unpriced
                            ? count
                            : `${count} × ${formatRate(item.rate, tier.kind)}`,
                    cents: unpriced ? 0 : item.subtotal,
                },
            ];
        }

        const kind = lineItemKind(item.description);

        if ((kind === 'trial' || kind === 'freeTier') && item.subtotal === 0) {
            return [];
        }

        let description = adjustmentDescription(item);
        if (kind === 'trial') {
            description = 'Free trial credit';
        } else if (kind === 'freeTier') {
            description = 'Free tier credit';
        } else if (item.subtotal < 0 && item.description) {
            description = `Credit: ${item.description}`;
        }

        return [
            {
                description,
                quantity: null,
                cents: unpriced ? 0 : item.subtotal,
            },
        ];
    });
}
