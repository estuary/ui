import { useQuery } from 'urql';

import { TENANT_BILLING_CONTACT_QUERY } from 'src/api/gql/billing';
import { readBilling } from 'src/hooks/billing/shared';

export function useBillingContact(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_CONTACT_QUERY,
        variables: { tenant },
    });

    const read = readBilling(tenant, data, error);

    return {
        contact: read.billing?.contact,
        isLoading: fetching && !data,
        error: read.error,
    };
}
