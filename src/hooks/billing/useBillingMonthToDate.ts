import { useQuery } from 'urql';

import { TENANT_BILLING_MONTH_TO_DATE_QUERY } from 'src/api/gql/billing';
import { readBilling } from 'src/hooks/billing/shared';

export function useBillingMonthToDate(tenant: string) {
    // Callers remount when the tenant changes, so no earlier tenant's data
    // is retained here.
    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_MONTH_TO_DATE_QUERY,
        variables: { tenant },
    });

    const read = readBilling(tenant, data, error);
    const monthToDate = read.billing?.monthToDate ?? undefined;

    return {
        monthToDate,
        isLoading: fetching && !data,
        // Null, with an error, when the month's usage can't be read.
        error:
            read.error ??
            (data && !monthToDate
                ? new Error(`Unable to load this month's charges`)
                : undefined),
    };
}
