import { useQuery } from 'urql';

import { TENANT_BILLING_CONTACT_QUERY } from 'src/api/gql/billing';

export function useBillingContact(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, error }] = useQuery({
        query: TENANT_BILLING_CONTACT_QUERY,
        variables: { tenant },
        pause: !tenant,
    });

    return {
        contact: data?.tenant?.billing.contact,
        isLoading: !data && !error,
        error,
    };
}
