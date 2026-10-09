import { useMemo } from 'react';

import { BILLING_CAPABILITIES_QUERY } from 'src/api/gql/billing';
import { useAllPages } from 'src/api/gql/useAllPages';
import { stripPathing } from 'src/utils/misc-utils';

// Billing is authorized against the tenant itself, so only bits held at the
// tenant prefix count. A grant on `acme/team/` does not cover `acme/`.
export function useBillingAccess(tenant: string) {
    const { data, loading, error } = useAllPages(BILLING_CAPABILITIES_QUERY, {
        getConnection: (result) => result.prefixes,
        transform: (node) => node,
    });

    // The tenants whose billing the user can view.
    const tenants = useMemo(
        () =>
            data
                .filter(
                    ({ prefix, capabilities }) =>
                        prefix === stripPathing(prefix, true) &&
                        capabilities.includes('ViewBilling')
                )
                .map(({ prefix }) => prefix),
        [data]
    );

    return {
        tenants,
        canView: tenants.includes(tenant),
        isLoading: loading,
        error,
    };
}
