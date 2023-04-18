import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import useBillingHistory from 'components/tables/Billing/useBillingHistory';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { useBilling_hydrateContinuously } from 'stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps, ProjectedCostStats } from 'types';

// Hydrator
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<ProjectedCostStats>;
}

export const BillingHistoryTableHydrator = ({
    children,
    query,
}: TableHydratorProps) => {
    const setQuery = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setQuery']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.query.set);

    const hydrateState = useBilling_hydrateContinuously();

    const { billingHistory, error, isValidating } = useBillingHistory({
        query,
    });

    useEffect(() => {
        setQuery(query);
    }, [setQuery, query]);

    useEffect(() => {
        if (!isValidating) {
            hydrateState(billingHistory, error);
        }
    }, [hydrateState, billingHistory, error, isValidating]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BillingHistoryTableHydrator;
