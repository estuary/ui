import { useQuery } from 'urql';

import { BILLING_CAPABILITIES_QUERY } from 'src/api/gql/billing';

// Billing is authorized against the tenant itself, so only bits held at the
// tenant prefix count. A grant on `acme/team/` does not cover `acme/`.
export function useBillingAccess(tenant: string) {
    const [{ data, error, operation }] = useQuery({
        query: BILLING_CAPABILITIES_QUERY,
        variables: { tenant },
        pause: !tenant,
    });

    // URQL can retain the previous tenant's result while this one loads.
    const current = operation?.variables.tenant === tenant;
    const capabilities = current
        ? (data?.prefixes.edges[0]?.node.capabilities ?? [])
        : [];

    return {
        canView: capabilities.includes('ViewBilling'),
        canEdit: capabilities.includes('EditBilling'),
        isLoading: !current,
        error: current ? error : undefined,
    };
}
