import type { DateTime } from 'luxon';
import type { TaskUsageInvoicesQuery } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { TASK_USAGE_INVOICES_QUERY } from 'src/api/gql/billingUsage';
import { useAllPages } from 'src/api/gql/useAllPages';
import { sumCents } from 'src/components/admin/Billing/shared/lineItems';

// One month's data and task charges, beside the usage they were priced from.
export interface MonthCharges {
    dataCents: number;
    taskCents: number;
    gb: number;
    hours: number;
}

// Keyed by month, as yyyy-MM.
export type ChargesByMonth = Record<string, MonthCharges>;

type InvoiceConnection = NonNullable<
    TaskUsageInvoicesQuery['tenant']
>['billing']['invoices'];

type InvoiceNode = InvoiceConnection['edges'][number]['node'];

const NO_INVOICES: InvoiceConnection = {
    edges: [],
    pageInfo: { hasNextPage: false },
};

// A month stays PREVIEW until it is frozen into FINAL, so a FINAL wins over a
// PREVIEW of the same month. MANUAL invoices are not usage.
export function toMonthCharges(invoices: InvoiceNode[]): ChargesByMonth {
    const charges: ChargesByMonth = {};
    const frozen = new Set<string>();

    invoices.forEach(({ dateStart, extra, invoiceType, lineItems }) => {
        const month = dateStart.slice(0, 7);

        if (invoiceType === 'MANUAL' || frozen.has(month)) {
            return;
        }

        if (invoiceType === 'FINAL') {
            frozen.add(month);
        }

        charges[month] = {
            dataCents: sumCents(lineItems ?? [], 'data'),
            taskCents: sumCents(lineItems ?? [], 'hours'),
            gb: extra?.processed_data_gb ?? 0,
            hours: extra?.task_usage_hours ?? 0,
        };
    });

    return charges;
}

// The charges of every month from `from` through `to`.
export function useTaskUsageCharges(
    tenant: string,
    from: DateTime,
    to: DateTime,
    pause: boolean
) {
    const { data, loading, error } = useAllPages(TASK_USAGE_INVOICES_QUERY, {
        variables: {
            tenant,
            // Exclusive, like every date in the invoice filter.
            filter: {
                dateStart: {
                    gt: from.startOf('month').minus({ days: 1 }).toISODate(),
                    lt: to.startOf('month').plus({ months: 1 }).toISODate(),
                },
            },
        },
        // A failed read can hold nulls the schema rules out.
        getConnection: (result) =>
            result.tenant?.billing?.invoices ?? NO_INVOICES,
        transform: (node: InvoiceNode) => node,
        pause,
    });

    const charges = useMemo(() => toMonthCharges(data), [data]);

    return { charges, loading, error };
}
