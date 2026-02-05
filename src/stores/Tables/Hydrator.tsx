import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { SelectableTableStore } from 'src/stores/Tables/Store';
import type { BaseComponentProps } from 'src/types';

import { useEffect, useRef } from 'react';

import { useUnmount } from 'react-use';

import { useZustandStore } from 'src/context/Zustand/provider';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

// Hydrator
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<any, any, any, any, any> | null;
    selectableTableStoreName: SelectTableStoreNames;
    disableMultiSelect?: boolean;
    disableQueryParamHack?: boolean;
}

export const TableHydrator = ({
    children,
    disableMultiSelect,
    query,
    selectableTableStoreName,
    disableQueryParamHack,
}: TableHydratorProps) => {
    const skipFirstHydration = useRef(!disableQueryParamHack);

    const setQuery = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setQuery']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.set);

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.hydrate);

    const resetState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(selectableTableStoreName, selectableTableStoreSelectors.state.reset);

    const setDisableMultiSelect = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setDisableMultiSelect']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.disableMultiSelect.set
    );

    useEffect(() => {
        setDisableMultiSelect(disableMultiSelect ?? false);
    }, [disableMultiSelect, setDisableMultiSelect]);

    useEffect(() => {
        if (query) {
            // THIS IS GROSS!
            // Our table queries update the URL and use a library to help manage that. This library
            //  ties in with the react router which means there will be an extra render. So on most table
            //  we do not want this and can just skip one of the updates.
            // TODO (query param rendering)
            // Read More: https://github.com/pbeshai/use-query-params/issues/160
            if (skipFirstHydration.current) {
                skipFirstHydration.current = false;
                return;
            }

            setQuery(query);
            hydrate();
        }
    }, [hydrate, query, setQuery]);

    // Reset state when leaving until we work out how we want to cache table stuff
    useUnmount(() => {
        setDisableMultiSelect(false);

        // TODO (cache) https://github.com/estuary/ui/issues/815
        resetState(true);
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default TableHydrator;
