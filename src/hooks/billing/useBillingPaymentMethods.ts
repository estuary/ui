import { useQuery } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';

export function useBillingPaymentMethods(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }, reexecute] = useQuery({
        query: TENANT_BILLING_PAYMENT_METHODS_QUERY,
        variables: { tenant },
        pause: !tenant,
    });

    return {
        billing: data?.tenant?.billing,
        isLoading: !tenant || (fetching && !data),
        error,
        refresh: () => reexecute({ requestPolicy: 'network-only' }),
    };
}
