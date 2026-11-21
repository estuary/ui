import { useQuery } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';
import { readBilling } from 'src/hooks/billing/shared';

export function useBillingPaymentMethods(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }, reexecute] = useQuery({
        query: TENANT_BILLING_PAYMENT_METHODS_QUERY,
        variables: { tenant },
        pause: !tenant,
    });

    const read = readBilling(tenant, data, error);

    return {
        billing: read.billing,
        isLoading: !tenant || (fetching && !data),
        error: read.error,
        refresh: () => reexecute({ requestPolicy: 'network-only' }),
    };
}
