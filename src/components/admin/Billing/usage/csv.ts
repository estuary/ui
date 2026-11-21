import type { UsageBucket } from 'src/components/admin/Billing/usage/period';
import type { TaskUsageRow } from 'src/components/admin/Billing/usage/rows';

import {
    DELETED_TASKS,
    toGb,
    toHours,
} from 'src/components/admin/Billing/usage/rows';
import { tableExportSeparator } from 'src/components/tables/shared';

export type ExportGrouping = 'day' | 'month';

export type ExportColumn = 'gb' | 'hours' | 'cost';

const COLUMN_HEADERS: Record<ExportColumn, string> = {
    gb: 'data_gb',
    hours: 'task_hours',
    cost: 'cost_usd',
};

interface CsvGroup {
    date: string;
    indexes: number[];
}

// Rows by day need daily buckets; by month, either kind.
const toGroups = (buckets: UsageBucket[], grouping: ExportGrouping) =>
    buckets.reduce<CsvGroup[]>((groups, bucket, index) => {
        if (bucket.future) {
            return groups;
        }

        const date = grouping === 'day' ? bucket.key : bucket.key.slice(0, 7);
        const last = groups.at(-1);

        if (last?.date === date) {
            last.indexes.push(index);
        } else {
            groups.push({ date, indexes: [index] });
        }

        return groups;
    }, []);

// Tasks by name, then the usage of deleted ones.
const byName = (rows: TaskUsageRow[]) =>
    [...rows].sort(
        (a, b) =>
            Number(a.name === DELETED_TASKS) -
                Number(b.name === DELETED_TASKS) || a.name.localeCompare(b.name)
    );

export const countCsvRows = (
    rows: TaskUsageRow[],
    buckets: UsageBucket[],
    grouping: ExportGrouping
) => toGroups(buckets, grouping).length * rows.length;

// One row per task per day or month, the header aside. Stops after `limit`
// rows when given, for a preview.
export function toCsvRows(
    rows: TaskUsageRow[],
    buckets: UsageBucket[],
    grouping: ExportGrouping,
    columns: ExportColumn[],
    limit?: number
): string[][] {
    const sorted = byName(rows);
    const result: string[][] = [];

    for (const { date, indexes } of toGroups(buckets, grouping)) {
        for (const row of sorted) {
            if (limit !== undefined && result.length >= limit) {
                return result;
            }

            let bytes = 0;
            let seconds = 0;
            let cents = 0;
            indexes.forEach((index) => {
                bytes += row.usage[index]?.bytes ?? 0;
                seconds += row.usage[index]?.seconds ?? 0;
                cents += row.costs?.[index] ?? 0;
            });

            const values: Record<ExportColumn, string> = {
                gb: toGb(bytes).toFixed(3),
                hours: toHours(seconds).toFixed(2),
                cost: (cents / 100).toFixed(2),
            };

            result.push([
                date,
                row.name,
                ...columns.map((column) => values[column]),
            ]);
        }
    }

    return result;
}

// The file's text, header first. With a `limit`, only that many rows follow,
// for a preview.
export const toCsv = (
    rows: TaskUsageRow[],
    buckets: UsageBucket[],
    grouping: ExportGrouping,
    columns: ExportColumn[],
    limit?: number
) =>
    [
        ['date', 'task', ...columns.map((column) => COLUMN_HEADERS[column])],
        ...toCsvRows(rows, buckets, grouping, columns, limit),
    ]
        .map((row) => row.join(tableExportSeparator))
        .join('\n');
