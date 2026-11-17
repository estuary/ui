import { useQuery } from 'urql';

import { TENANT_BILLING_CONTACT_QUERY } from 'src/api/gql/billing';

export function useBillingContact(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_CONTACT_QUERY,
        variables: { tenant },
    });

    // A null tenant means the read failed or the caller can't see the tenant,
    // not that the contact is missing. Graphcache can return null data for it.
    const tenantMissing = data !== undefined && !data?.tenant;

    return {
        contact: data?.tenant?.billing.contact,
        isLoading: fetching && !data,
        error:
            error ??
            (tenantMissing
                ? new Error(`Unable to load billing for ${tenant}`)
                : undefined),
    };
}
