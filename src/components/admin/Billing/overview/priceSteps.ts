import type { PricingTier } from 'src/api/gql/billing';
import type { UsageKind } from 'src/components/admin/Billing/shared/format';

import {
    formatGb,
    formatHours,
    formatQuantity,
    formatQuantityRange,
    formatRate,
} from 'src/components/admin/Billing/shared/format';

// This shows where this month's usage sits among a plan's price tiers. The
// server does the pricing; nothing here computes charges.

interface TierRange {
    rateCents: number;
    from: number;
    // Null for the last tier, which covers all further usage.
    to: number | null;
}

const tierRanges = (tiers: PricingTier[]): TierRange[] => {
    let from = 0;

    return tiers.map(({ rateCents, quantity }) => {
        const range = {
            rateCents,
            from,
            to: typeof quantity === 'number' ? from + quantity : null,
        };
        from = range.to ?? from;
        return range;
    });
};

const currentTierIndex = (ranges: TierRange[], used: number) => {
    const index = ranges.findIndex(({ to }) => to !== null && used < to);

    return index === -1 ? ranges.length - 1 : index;
};

const rateLabel = (rateCents: number, kind: UsageKind) =>
    rateCents === 0 ? 'Included' : formatRate(rateCents, kind);

const rangeLabel = (range: TierRange, index: number, kind: UsageKind) => {
    if (range.to === null) {
        return `over ${formatQuantity(range.from, kind)}`;
    }

    return index === 0
        ? `first ${formatQuantity(range.to, kind)}`
        : formatQuantityRange(range.from, range.to, kind);
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export interface PriceStep {
    state: 'passed' | 'current' | 'later';
    // Steps are as tall as their rate, so they step down as the rate drops.
    heightPercent: number;
    // How much of the current step this month's usage has filled.
    fillPercent: number;
    label: string;
    tooltip: string;
}

export interface UsageMeter {
    // Empty for a single rate.
    steps: PriceStep[];
    // A plain bar filled this far, as for a limit, in place of steps.
    percent?: number;
    quantity: string;
    next: string;
}

export function usageMeter(
    tiers: PricingTier[],
    used: number,
    kind: UsageKind
): UsageMeter {
    const unit = kind === 'data' ? formatGb : formatHours;
    const ranges = tierRanges(tiers);
    const index = currentTierIndex(ranges, used);
    const tier = ranges[index];

    if (ranges.length === 1) {
        return {
            steps: [],
            quantity:
                tier.rateCents === 0
                    ? `${unit(used)} included`
                    : `${unit(used)} at ${formatRate(tier.rateCents, kind)}`,
            next: 'Flat rate',
        };
    }

    // Contracts include usage as leading tiers at no charge.
    const overIncluded = index > 0 && ranges[index - 1].rateCents === 0;
    const topRate = Math.max(...ranges.map(({ rateCents }) => rateCents)) || 1;

    // The open last tier has no end, so it's drawn as if it were as wide as
    // the tier before it, or a bit wider than this month's usage in it.
    const width = (range: TierRange, i: number) => {
        if (range.to !== null) {
            return range.to - range.from;
        }

        const before = ranges[i - 1];
        return Math.max(
            before.to === null ? 1 : before.to - before.from,
            (used - range.from) * 1.25
        );
    };

    const steps = ranges.map((range, i): PriceStep => {
        const usedInStep = Math.max(
            0,
            Math.min(used, range.to ?? Infinity) - range.from
        );
        const rate = rateLabel(range.rateCents, kind);

        return {
            state: i < index ? 'passed' : i === index ? 'current' : 'later',
            heightPercent:
                range.rateCents === 0
                    ? 10
                    : 12 + (range.rateCents / topRate) * 88,
            fillPercent:
                i < index
                    ? 100
                    : i > index
                      ? 0
                      : clamp(
                            ((used - range.from) / width(range, i)) * 100,
                            2,
                            98
                        ),
            label: i <= index ? `${rate} · ${unit(usedInStep)}` : rate,
            tooltip: `${rate}, ${rangeLabel(range, i, kind)}`,
        };
    });

    const quantity =
        tier.rateCents === 0 && tier.to !== null
            ? `${unit(used)} of ${unit(tier.to)} included`
            : overIncluded
              ? `${unit(used - tier.from)} over the ${unit(tier.from)} included`
              : `${unit(used)} used`;

    const next =
        tier.to === null
            ? overIncluded
                ? `Billed at ${formatRate(tier.rateCents, kind)}`
                : 'Lowest rate'
            : tier.rateCents === 0
              ? `Billed after ${unit(tier.to)}`
              : `Next drop at ${unit(tier.to)}`;

    return { steps, quantity, next };
}

export interface RateRow {
    range: string;
    rate: string;
    current: boolean;
}

export function rateRows(
    tiers: PricingTier[],
    used: number,
    kind: UsageKind
): RateRow[] {
    const ranges = tierRanges(tiers);
    const index = currentTierIndex(ranges, used);

    return ranges.map((range, i) => {
        const label = rangeLabel(range, i, kind);

        return {
            range:
                ranges.length === 1
                    ? 'Any volume'
                    : label.charAt(0).toUpperCase() + label.slice(1),
            rate: rateLabel(range.rateCents, kind),
            current: i === index,
        };
    });
}
