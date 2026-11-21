import { useMemo } from 'react';

import { useQuery } from 'urql';

import { TENANT_BILLING_INVOICES_QUERY } from 'src/api/gql/billing';
import { readBilling } from 'src/hooks/billing/shared';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

// A tenant's invoices, newest first, a page at a time.
export function useBillingInvoices(tenant: string, pageSize: number) {
    const { currentPage, cursor, onPageChange } = useCursorPagination();

    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_INVOICES_QUERY,
        variables: {
            tenant,
            first: pageSize,
            after: cursor,
            // Each invoice's Stripe status and links cost the server a Stripe
            // search, so only a paged read asks for them.
            withStripe: true,
        },
    });

    const read = readBilling(tenant, data, error);
    const connection = read.billing?.invoices;
    const invoices = useMemo(
        () => connection?.edges.map(({ node }) => node) ?? [],
        [connection]
    );

    return {
        invoices,
        page: currentPage,
        hasNextPage: Boolean(connection?.pageInfo.hasNextPage),
        onPageChange: (page: number) =>
            onPageChange(undefined, page, connection?.pageInfo.endCursor),
        isLoading: fetching && !data,
        error: read.error,
    };
}
