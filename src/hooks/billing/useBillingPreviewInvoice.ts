import { useQuery } from 'urql';

import { TENANT_BILLING_INVOICES_QUERY } from 'src/api/gql/billing';
import {
    previousMonthEnd,
    utcToday,
} from 'src/components/admin/Billing/shared/format';
import { readBilling } from 'src/hooks/billing/shared';

// This UTC month's invoice, which stays a PREVIEW until the month is frozen
// into a FINAL one.
export function useBillingPreviewInvoice(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_INVOICES_QUERY,
        variables: {
            tenant,
            filter: {
                invoiceType: { eq: 'PREVIEW' },
                dateStart: { gt: previousMonthEnd(utcToday()) },
            },
            first: 1,
            withStripe: false,
        },
    });

    const read = readBilling(tenant, data, error);

    return {
        invoice: read.billing?.invoices.edges[0]?.node,
        isLoading: fetching && !data,
        error: read.error,
    };
}
