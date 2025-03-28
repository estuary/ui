import { useEffect } from 'react';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useZustandStore } from 'src/context/Zustand/provider';
import type { SelectTableStoreNames } from 'src/stores/names';
import type {
    SelectableTableStore} from 'src/stores/Tables/Store';
import {
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import type { BaseComponentProps } from 'src/types';

// Hydrator
interface StatsHydratorProps extends BaseComponentProps {
    selectableTableStoreName: SelectTableStoreNames;
}

const StatsHydrator = ({
    children,
    selectableTableStoreName,
}: StatsHydratorProps) => {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

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
        if (hasAnyAccess && !queryLoading && queryResponse) {
            setStats();
        }
    }, [queryLoading, queryResponse, setStats, hasAnyAccess]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default StatsHydrator;
