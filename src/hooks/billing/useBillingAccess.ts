import { BILLING_CAPABILITIES_QUERY } from 'src/api/gql/billing';
import { useAllPages } from 'src/api/gql/useAllPages';

// Billing is authorized against the tenant itself, so only bits held at the
// tenant prefix count. A grant on `acme/team/` does not cover `acme/`.
export function useBillingAccess(tenant: string) {
    const { data, loading, error } = useAllPages(BILLING_CAPABILITIES_QUERY, {
        getConnection: (result) => result.prefixes,
        transform: (node) => node,
    });

    const capabilities =
        data.find(({ prefix }) => prefix === tenant)?.capabilities ?? [];

    return {
        canView: capabilities.includes('ViewBilling'),
        canEdit: capabilities.includes('EditBilling'),
        isLoading: loading,
        error,
    };
}
