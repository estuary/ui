import { useTenantDetails } from 'context/fetcher/Tenant';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

// Hydrator
interface StatsHydratorProps extends BaseComponentProps {
    selectableTableStoreName: SelectTableStoreNames;
}

const StatsHydrator = ({
    children,
    selectableTableStoreName,
}: StatsHydratorProps) => {
    const tenants = useTenantDetails();

    const queryLoading = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['loading']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.loading);

    const queryResponse = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['response']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.response);

    const setStats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setStats']
    >(selectableTableStoreName, selectableTableStoreSelectors.stats.set);

    useEffect(() => {
        if (hasLength(tenants) && !queryLoading && queryResponse) {
            setStats();
        }
    }, [queryLoading, queryResponse, setStats, tenants]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default StatsHydrator;
