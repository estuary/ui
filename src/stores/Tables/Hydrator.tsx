import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps } from 'types';

// Hydrator
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<any, any, any> | null;
    selectableTableStoreName: SelectTableStoreNames;
    disableMultiSelect?: boolean;
}

export const TableHydrator = ({
    children,
    disableMultiSelect,
    query,
    selectableTableStoreName,
}: TableHydratorProps) => {
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

    useUpdateEffect(() => {
        if (query) {
            console.log('hydrate', hydrate);
            setQuery(query);
            hydrate();
        }
    }, [hydrate, query, setQuery]);

    // Reset state when leaving until we work out how we want to cache table stuff
    useUnmount(() => {
        setDisableMultiSelect(false);

        // TODO (https://github.com/estuary/ui/issues/815)
        resetState();
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default TableHydrator;
