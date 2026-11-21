import { useQuery } from 'urql';

import { TENANT_BILLING_PLAN_QUERY } from 'src/api/gql/billing';
import { readBilling } from 'src/hooks/billing/shared';

export function useBillingPlan(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_PLAN_QUERY,
        variables: { tenant },
    });

    const read = readBilling(tenant, data, error);

    return {
        plan: read.billing?.plan,
        isLoading: fetching && !data,
        error: read.error,
    };
}
