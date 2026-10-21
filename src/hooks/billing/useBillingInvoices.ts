import { useMemo } from 'react';

import {
    addMonths,
    endOfMonth,
    format,
    startOfMonth,
    subMonths,
} from 'date-fns';
import { useQuery } from 'urql';

import { TENANT_BILLING_INVOICES_QUERY } from 'src/api/gql/billing';
import { useCursorPagination } from 'src/hooks/useCursorPagination';
import { useTenantStore } from 'src/stores/Tenant';

const day = (date: Date) => format(date, 'yyyy-MM-dd');

// The last `months` months, through the current one.
const lastMonths = (months: number) => ({
    dateStart: { gt: day(endOfMonth(subMonths(new Date(), months))) },
    dateEnd: { lt: day(startOfMonth(addMonths(new Date(), 1))) },
});

interface BillingInvoicesOptions {
    months?: number;
    pageSize?: number;
    // Each invoice's Stripe status and links cost the server a Stripe search,
    // so only a paged read should ask for them.
    withStripe?: boolean;
}

// The selected tenant's invoices, newest first.
export function useBillingInvoices({
    months,
    pageSize,
    withStripe = false,
}: BillingInvoicesOptions) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { currentPage, cursor, onPageChange } = useCursorPagination();

    const filter = useMemo(
        () => (months ? lastMonths(months) : undefined),
        [months]
    );

    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_INVOICES_QUERY,
        variables: {
            tenant: selectedTenant,
            filter,
            first: pageSize,
            after: cursor,
            withStripe,
        },
    });

    if (error) {
        throw error;
    }

    const connection = data?.tenant?.billing.invoices;
    const invoices = useMemo(
        () => connection?.edges.map(({ node }) => node) ?? [],
        [connection]
    );

    return {
        invoices,
        page: currentPage,
        hasNextPage: Boolean(connection?.pageInfo.hasNextPage),
        onPageChange: (event: unknown, page: number) =>
            onPageChange(event, page, connection?.pageInfo.endCursor),
        isLoading: fetching,
    };
}
