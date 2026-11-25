import type { UsageBucket } from 'src/components/admin/Billing/usage/period';
import type {
    ChargesByMonth,
    MonthCharges,
} from 'src/hooks/billing/useTaskUsageCharges';
import type {
    UsageAmounts,
    UsageStats,
} from 'src/hooks/billing/useTaskUsageStats';
import type { TaskKind, UsageTask } from 'src/hooks/billing/useTaskUsageTasks';

import { countDays, parseDay } from 'src/components/admin/Billing/usage/period';

// Billing counts decimal gigabytes.
const BYTES_PER_GB = 1e9;
const SECONDS_PER_HOUR = 3600;

// The usage of tasks no longer in the catalog: the tenant's own total less
// that of its live tasks. The space keeps it from matching a catalog name.
export const DELETED_TASKS = 'Deleted tasks';

// Below this share of a total, the "Other" segment would be a hairline.
const MIN_OTHER_SHARE = 0.0005;

export type SortKey = 'gb' | 'hours';

export type ShareMetric = SortKey | 'costCents';

export interface TaskUsageRow {
    name: string;
    // Null for DELETED_TASKS.
    kind: TaskKind | null;
    // Per bucket. Null for a bucket still to come.
    usage: (UsageAmounts | null)[];
    // Per bucket, in cents. Null when there is no cost to show.
    costs: number[] | null;
    gb: number;
    hours: number;
    costCents: number | null;
}

interface ShareSegment {
    // Null for the segment of every task not named.
    name: string | null;
    value: number;
}

const NO_USAGE: UsageAmounts = { bytes: 0, seconds: 0 };

const sum = (values: number[]) =>
    values.reduce((total, value) => total + value, 0);

export const toGb = (bytes: number) => bytes / BYTES_PER_GB;

export const toHours = (seconds: number) => seconds / SECONDS_PER_HOUR;

// A month's data and task charges, split by the usage's share of what the
// month was billed for. Allocation of the invoice's amounts, not pricing.
export function allocateCostCents(
    usage: UsageAmounts,
    charges: MonthCharges | undefined
) {
    if (!charges) {
        return 0;
    }

    const dataShare = charges.gb > 0 ? toGb(usage.bytes) / charges.gb : 0;
    const taskShare =
        charges.hours > 0 ? toHours(usage.seconds) / charges.hours : 0;

    return charges.dataCents * dataShare + charges.taskCents * taskShare;
}

// The share of a bucket's days from `billedFrom` (yyyy-MM-dd) on. Days before
// it cost nothing: a self-serve tenant's free tier and then its trial credit
// them in full, though the month's charges are priced before those credits.
const billedShare = (bucket: UsageBucket, billedFrom: string | null) => {
    if (!billedFrom || bucket.key >= billedFrom) {
        return 1;
    }

    const from = parseDay(billedFrom);

    return bucket.end < from
        ? 0
        : countDays(from, bucket.end) / countDays(bucket.start, bucket.end);
};

const toRow = (
    name: string,
    kind: TaskKind | null,
    usage: (UsageAmounts | null)[],
    buckets: UsageBucket[],
    charges: ChargesByMonth | null,
    billedFrom: string | null
): TaskUsageRow => {
    const costs = charges
        ? usage.map((amounts, index) =>
              amounts
                  ? allocateCostCents(
                        amounts,
                        charges[buckets[index].key.slice(0, 7)]
                    ) * billedShare(buckets[index], billedFrom)
                  : 0
          )
        : null;

    return {
        name,
        kind,
        usage,
        costs,
        gb: toGb(sum(usage.map((amounts) => amounts?.bytes ?? 0))),
        hours: toHours(sum(usage.map((amounts) => amounts?.seconds ?? 0))),
        costCents: costs ? sum(costs) : null,
    };
};

// A row per task, plus DELETED_TASKS when the tenant's total holds usage its
// live tasks don't account for.
export function buildUsageRows(
    tasks: UsageTask[],
    tenant: string,
    stats: UsageStats,
    buckets: UsageBucket[],
    charges: ChargesByMonth | null,
    billedFrom: string | null = null
): TaskUsageRow[] {
    const read = (name: string) =>
        buckets.map((bucket) =>
            bucket.future
                ? null
                : (stats.get(name)?.get(bucket.key) ?? NO_USAGE)
        );

    const rows = tasks.map(({ name, kind }) =>
        toRow(name, kind, read(name), buckets, charges, billedFrom)
    );

    // Clamped at zero: the tenant's total and its tasks' are separate rows,
    // which can be a moment apart.
    const deleted = read(tenant).map((total, index) => {
        if (!total) {
            return null;
        }

        const live = sum(rows.map(({ usage }) => usage[index]?.bytes ?? 0));
        const liveSeconds = sum(
            rows.map(({ usage }) => usage[index]?.seconds ?? 0)
        );

        return {
            bytes: Math.max(0, total.bytes - live),
            seconds: Math.max(0, total.seconds - liveSeconds),
        };
    });

    const hasDeleted = deleted.some(
        (amounts) => amounts && (amounts.bytes > 0 || amounts.seconds > 0)
    );

    return hasDeleted
        ? [
              ...rows,
              toRow(DELETED_TASKS, null, deleted, buckets, charges, billedFrom),
          ]
        : rows;
}

export function filterRows(rows: TaskUsageRow[], query: string) {
    const needle = query.trim().toLowerCase();

    return needle
        ? rows.filter(({ name }) => name.toLowerCase().includes(needle))
        : rows;
}

// Largest first, by name among equals.
export const sortRows = (rows: TaskUsageRow[], key: SortKey) =>
    [...rows].sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name));

// What the rows used in each bucket, together. Null for a bucket still to come.
export const sumBuckets = (
    rows: TaskUsageRow[],
    buckets: UsageBucket[]
): (UsageAmounts | null)[] =>
    buckets.map((bucket, index) =>
        bucket.future
            ? null
            : {
                  bytes: sum(rows.map(({ usage }) => usage[index]?.bytes ?? 0)),
                  seconds: sum(
                      rows.map(({ usage }) => usage[index]?.seconds ?? 0)
                  ),
              }
    );

const metricOf = (row: TaskUsageRow, metric: ShareMetric) => row[metric] ?? 0;

// One metric's total split into a segment for each named task that used any,
// in the order named, and one for everything else.
export function shareSegments(
    rows: TaskUsageRow[],
    names: string[],
    metric: ShareMetric
) {
    const total = sum(rows.map((row) => metricOf(row, metric)));
    const named = names.flatMap(
        (name) => rows.find((row) => row.name === name) ?? []
    );

    const segments: ShareSegment[] = named
        .map((row) => ({ name: row.name, value: metricOf(row, metric) }))
        .filter(({ value }) => value > 0);

    const rest = total - sum(segments.map(({ value }) => value));
    if (total > 0 && rest / total > MIN_OTHER_SHARE) {
        segments.push({ name: null, value: rest });
    }

    return { total, segments };
}

// 10% / <1% / 0%
export function formatShare(value: number, total: number) {
    if (total <= 0) {
        return '0%';
    }

    const share = value / total;

    return share > 0 && share < 0.01 ? '<1%' : `${Math.round(share * 100)}%`;
}
