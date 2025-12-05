import type {
    CaptureQueryWithStats,
    CollectionQueryWithStats,
    MaterializationQueryWithStats,
} from 'src/api/liveSpecsExt';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useEffect, useMemo, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useZustandStore } from 'src/context/Zustand/provider';
import useShardHydration from 'src/hooks/shards/useShardHydration';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

type Data =
    | CaptureQueryWithStats[]
    | MaterializationQueryWithStats[]
    | CollectionQueryWithStats[];

function useRowsWithStatsState(
    selectTableStoreName: SelectTableStoreNames,
    data: Data
) {
    const previousCount = useRef<null | Number>(null);
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
        useShallow(selectableTableStoreSelectors.successfulTransformations.get)
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
        console.log('successfulTransformations = ', successfulTransformations);
        console.log('previousCount.current = ', previousCount.current);

        previousCount.current = successfulTransformations;
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
