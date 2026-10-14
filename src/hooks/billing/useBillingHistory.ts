import type { Invoice } from 'src/api/billing';

import { useMemo } from 'react';

import { useQuery } from 'urql';

import {
    BILLING_HISTORY_PAGE_SIZE,
    TENANT_BILLING_HISTORY_QUERY,
} from 'src/api/gql/billing';
import { mapInvoice } from 'src/hooks/billing/useBillingInvoices';
import { useCursorPagination } from 'src/hooks/useCursorPagination';
import { useTenantStore } from 'src/stores/Tenant';

// Pages through the selected tenant's invoices, newest first.
export function useBillingHistory() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { currentPage, cursor, onPageChange } = useCursorPagination();

    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_HISTORY_QUERY,
        variables: {
            tenant: selectedTenant,
            first: BILLING_HISTORY_PAGE_SIZE,
            after: cursor,
        },
    });

    const connection = data?.tenant?.billing.invoices;
    const invoices = useMemo(
        () =>
            connection?.edges.map(
                ({ node }): Invoice => ({
                    ...mapInvoice(node, selectedTenant),
                    status: node.status,
                    invoice_pdf: node.invoicePdf,
                    hosted_invoice_url: node.hostedInvoiceUrl,
                })
            ) ?? [],
        [connection, selectedTenant]
    );

    return {
        invoices,
        page: currentPage,
        hasNextPage: Boolean(connection?.pageInfo.hasNextPage),
        onPageChange: (event: unknown, page: number) =>
            onPageChange(event, page, connection?.pageInfo.endCursor),
        isLoading: fetching,
        networkFailed: Boolean(error?.networkError),
    };
}
