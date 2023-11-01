import {
    CaptureQueryWithStats,
    CollectionQueryWithStats,
    MaterializationQueryWithStats,
} from 'api/liveSpecsExt';
import { useZustandStore } from 'context/Zustand/provider';
import useShardHydration from 'hooks/shards/useShardHydration';
import { useEffect, useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';

import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

type Data =
    | CaptureQueryWithStats[]
    | MaterializationQueryWithStats[]
    | CollectionQueryWithStats[];

function useRowsWithStatsState(
    selectTableStoreName: SelectTableStoreNames,
    data: Data
) {
    const catalogNames = useMemo(
        () => data.map((datum) => datum.catalog_name),
        [data]
    );

    const { mutate: mutateShardsList } = useShardHydration(catalogNames);

    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.set);

    const successfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['successfulTransformations']
    >(
        selectTableStoreName,
        selectableTableStoreSelectors.successfulTransformations.get
    );

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.get);

    useEffect(() => {
        mutateShardsList().catch(() => {});
    }, [mutateShardsList, successfulTransformations]);

    return useMemo(
        () => ({
            selected,
            setRow,
            stats,
        }),
        [selected, setRow, stats]
    );
}

export default useRowsWithStatsState;
