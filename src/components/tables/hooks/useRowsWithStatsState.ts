import type {
    CaptureQueryWithStats,
    CollectionQueryWithStats,
    MaterializationQueryWithStats,
} from 'api/liveSpecsExt';
import { useZustandStore } from 'context/Zustand/provider';
import useShardHydration from 'hooks/shards/useShardHydration';
import { useEffect, useMemo } from 'react';
import type { SelectTableStoreNames } from 'stores/names';

import type { SelectableTableStore } from 'stores/Tables/Store';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';

type Data =
    | CaptureQueryWithStats[]
    | MaterializationQueryWithStats[]
    | CollectionQueryWithStats[];

function useRowsWithStatsState(
    selectTableStoreName: SelectTableStoreNames,
    data: Data
) {
    const catalogNames = useMemo(
        () =>
            data
                .filter((datum) => datum.shard_template_id)
                .map((datum) => datum.catalog_name),
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

    const statsFailed = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['statsFailed']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.failed);

    useEffect(() => {
        mutateShardsList().catch(() => {});
    }, [mutateShardsList, successfulTransformations]);

    return useMemo(
        () => ({
            selected,
            setRow,
            stats,
            statsFailed,
        }),
        [selected, setRow, stats, statsFailed]
    );
}

export default useRowsWithStatsState;
