import { useQuery } from 'urql';

import { BILLING_CAPABILITIES_QUERY } from 'src/api/gql/billing';

// Billing is authorized against the tenant itself, so only bits held at the
// tenant prefix count. A grant on `acme/team/` does not cover `acme/`.
export function useBillingAccess(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: BILLING_CAPABILITIES_QUERY,
        variables: { tenant },
    });

    const capabilities = data?.prefixes.edges[0]?.node.capabilities ?? [];

    return {
        canView: capabilities.includes('ViewBilling'),
        canEdit: capabilities.includes('EditBilling'),
        isLoading: fetching && !data,
        error,
    };
}
