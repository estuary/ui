import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { useUnmount } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps } from 'types';

// Hydrator
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<any>;
    selectableTableStoreName: SelectTableStoreNames;
}

export const TableHydrator = ({
    children,
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

    useEffect(() => {
        console.log('query', query);
        setQuery(query);
        hydrate();
    }, [hydrate, query, setQuery]);

    // Reset state when leaving until we work out how we want to cache table stuff
    useUnmount(() => {
        resetState();
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default TableHydrator;
