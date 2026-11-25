import type { ChipProps } from '@mui/material';
import type { BillingPlan, PricingTier } from 'src/api/gql/billing';
import type { PaymentProvider } from 'src/gql-types/graphql';

import {
    daysBetween,
    formatDay,
    formatQuantity,
    formatWholeCents,
    nextMonthStart,
} from 'src/components/admin/Billing/shared/format';

type ContractPlan = Extract<BillingPlan, { __typename: 'ContractPlan' }>;

export const planName = (plan: BillingPlan) => {
    switch (plan.__typename) {
        case 'InternalPlan':
            return 'Internal';
        case 'ContractPlan':
            return 'Contract';
        case 'SelfServePlan':
            return plan.phase === 'FREE'
                ? 'Free tier'
                : plan.phase === 'TRIAL'
                  ? 'Free trial'
                  : 'Cloud';
    }
};

const MARKETPLACES: Partial<Record<PaymentProvider, string>> = {
    AWS_MARKETPLACE: 'AWS Marketplace',
    GCP_MARKETPLACE: 'GCP Marketplace',
    SNOWFLAKE_MARKETPLACE: 'Snowflake Marketplace',
};

export interface PlanChip {
    label: string;
    color: ChipProps['color'];
}

export function planChips(plan: BillingPlan, today: string): PlanChip[] {
    if (plan.__typename === 'ContractPlan') {
        const marketplace = MARKETPLACES[plan.paymentProvider];

        return marketplace ? [{ label: marketplace, color: 'default' }] : [];
    }

    if (
        plan.__typename === 'SelfServePlan' &&
        plan.phase === 'TRIAL' &&
        plan.trial
    ) {
        // The trial's end is exclusive, so its last day counts as one left.
        const daysLeft = daysBetween(today, plan.trial.end);

        return [
            {
                label: daysLeft === 1 ? '1 day left' : `${daysLeft} days left`,
                color: 'info',
            },
        ];
    }

    return [];
}

// Contracts include usage as leading tiers at no charge.
const includedQuantity = (tiers: PricingTier[]) => {
    let included = 0;

    for (const { rateCents, quantity } of tiers) {
        if (rateCents !== 0 || typeof quantity !== 'number') {
            break;
        }
        included += quantity;
    }

    return included;
};

// "1,024 GB of data and 1,440 task hours"
function includedUsage(plan: ContractPlan) {
    const gb = includedQuantity(plan.dataTiers);
    const hours = includedQuantity(plan.usageTiers);

    const parts = [
        gb > 0 ? `${formatQuantity(gb, 'data')} of data` : null,
        hours > 0 ? formatQuantity(hours, 'hours') : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' and ') : null;
}

export interface PlanSentenceInput {
    plan: BillingPlan;
    today: string;
    // The rest come from other reads, and the sentence leaves out what didn't
    // load.
    projectedSubtotalCents?: number;
    // From this month's preview invoice. A contract's overage is the
    // projection less this, so it needs both.
    recurringFeeCents?: number;
    paymentMethod?: string | null;
    contactEmail?: string | null;
}

export function planSentence({
    plan,
    today,
    projectedSubtotalCents,
    recurringFeeCents,
    paymentMethod,
    contactEmail,
}: PlanSentenceInput) {
    if (plan.__typename === 'InternalPlan') {
        return 'Internal Estuary tenant. Usage is recorded but not billed.';
    }

    const billedOn = formatDay(nextMonthStart(today));
    const charged = plan.collectionMethod === 'CHARGE_DEFAULT_PAYMENT_METHOD';

    if (plan.__typename === 'SelfServePlan') {
        if (plan.phase === 'FREE') {
            return 'Up to 2 tasks and 10 GB of data a month, free. No card needed.';
        }

        if (plan.phase === 'TRIAL') {
            const until = plan.trial
                ? `until ${formatDay(plan.trial.end)}`
                : 'during your trial';
            return `Usage is free ${until}. After that it's billed monthly at the rates below.`;
        }

        const amount =
            projectedSubtotalCents === undefined
                ? ''
                : ` about ${formatWholeCents(Math.max(0, projectedSubtotalCents))}`;
        const recipient = charged
            ? paymentMethod
                ? `, charged to ${paymentMethod}`
                : ''
            : `, emailed to ${contactEmail ?? 'your billing contact'}`;

        return `Your next invoice is${amount} on ${billedOn}${recipient}.`;
    }

    const included = includedUsage(plan);
    const marketplace = MARKETPLACES[plan.paymentProvider];

    if (marketplace) {
        const overageTo = charged
            ? `charged to ${paymentMethod ?? 'your payment method'}`
            : 'invoiced by Estuary';

        return `Billed through ${marketplace}${
            included ? `, with ${included} included each month` : ''
        }. Overage is ${overageTo}.`;
    }

    const fee = recurringFeeCents
        ? `${formatWholeCents(recurringFeeCents)} a month`
        : null;
    const terms =
        fee && included
            ? `${fee} with ${included} included. `
            : fee
              ? `${fee}. `
              : included
                ? `${included} included each month. `
                : '';
    const overage =
        projectedSubtotalCents === undefined || recurringFeeCents === undefined
            ? ''
            : ` about ${formatWholeCents(
                  Math.max(0, projectedSubtotalCents - recurringFeeCents)
              )} this month,`;

    return `${terms}Overage is${overage} ${charged ? 'charged' : 'invoiced'} ${billedOn}.`;
}
