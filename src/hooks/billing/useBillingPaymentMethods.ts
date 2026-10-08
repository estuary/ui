import { useClient, useQuery } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';

export function useBillingPaymentMethods(tenant: string) {
    const client = useClient();
    const [{ data, fetching, error, operation }] = useQuery({
        query: TENANT_BILLING_PAYMENT_METHODS_QUERY,
        variables: { tenant },
        pause: !tenant,
    });

    // URQL can retain the previous response while query variables change.
    const current =
        operation?.variables.tenant === tenant &&
        (!data?.tenant || data.tenant.name === tenant);

    return {
        billing: current ? data?.tenant?.billing : undefined,
        isLoading: !tenant || !current || (fetching && !data),
        error: current ? error : undefined,
        refresh: () =>
            client
                .query(
                    TENANT_BILLING_PAYMENT_METHODS_QUERY,
                    { tenant },
                    { requestPolicy: 'network-only' }
                )
                .toPromise(),
    };
}
