import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { BillingRecord } from 'stores/Billing/types';
import { ProjectedCostStats } from 'types';
import { formatProjectedCostStats } from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';

interface Props {
    query: PostgrestFilterBuilder<ProjectedCostStats>;
}

const INTERVAL = 30000;

const defaultResponse: BillingRecord[] = [];

function useBillingHistory({ query }: Props) {
    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { data, error, mutate, isValidating } =
        useSelectNew<ProjectedCostStats>(
            hasLength(combinedGrants) ? query : null,
            {
                errorRetryCount: 3,
                errorRetryInterval: INTERVAL / 2,
                refreshInterval: INTERVAL,
                revalidateOnFocus: false,
            }
        );

    return {
        billingHistory: data
            ? formatProjectedCostStats(data.data)
            : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingHistory;
