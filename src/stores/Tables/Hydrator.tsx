import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { SelectTableStoreNames } from 'stores/names';
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

    useEffect(() => {
        setQuery(query);
        hydrate();
    }, [hydrate, query, setQuery]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default TableHydrator;
