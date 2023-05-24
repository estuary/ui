import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useZustandStore } from 'context/Zustand/provider';
import useBillingHistory from 'hooks/billing/useBillingHistory';
import { useEffect } from 'react';
import { useUnmount } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import { useBillingTable_hydrateContinuously } from 'stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps, CatalogStats_Billing } from 'types';

// TODO (billing): Use this method to hydrate the billing select table store when
//   a database table containing billing history is available. Currently, this component is
//   is no longer in use since the billing history table in the UI must source data from
//   the billing_report RPC.
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<CatalogStats_Billing>;
}

export const BillingHistoryTableHydrator = ({
    children,
    query,
}: TableHydratorProps) => {
    const setQuery = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setQuery']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.query.set);

    const resetState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    const hydrateState = useBillingTable_hydrateContinuously();

    const { billingHistory, error, isValidating } = useBillingHistory('');

    useEffect(() => {
        setQuery(query);
    }, [setQuery, query]);

    useEffect(() => {
        if (!isValidating) {
            hydrateState(billingHistory, error);
        }
    }, [hydrateState, billingHistory, error, isValidating]);

    // Reset state when leaving until we work out how we want to cache table stuff
    useUnmount(() => {
        resetState();
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BillingHistoryTableHydrator;
