import type {
    Dispatch,
    SetStateAction} from 'react';
import {
    useCallback,
    useEffect,
    useRef,
} from 'react';

import { useEffectOnce } from 'react-use';

import { useZustandStore } from 'src/context/Zustand/provider';
import type { Pagination } from 'src/services/supabase';
import type { SelectTableStoreNames } from 'src/stores/names';
import type {
    SelectableTableStore} from 'src/stores/Tables/Store';
import {
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import { getStartingPage } from 'src/utils/table-utils';

export function useTableUtils(
    pagination: Pagination,
    rowsPerPage: number,
    searchQuery: string | null,
    selectableTableStoreName: SelectTableStoreNames,
    setPage: Dispatch<SetStateAction<number>>,
    keepSelectionOnFilterOrSearch?: boolean
) {
    const searchTextField = useRef<HTMLInputElement>(null);

    const resetRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['removeRows']
    >(selectableTableStoreName, selectableTableStoreSelectors.rows.reset);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const resetSelection = useCallback(() => {
        setAll(false);
        resetRows();
    }, [resetRows, setAll]);

    // TODO (tables | optimization): Evaluate whether the hacky fix below is needed and remove if not.
    // Weird way but works for clear out the input. This is really only needed when
    //  a user enters text into the input on a page and then clicks the left nav of
    //  the page they are already on
    useEffect(() => {
        if (searchQuery === null) {
            if (searchTextField.current) {
                searchTextField.current.value = '';
            }
        }
    }, [searchQuery]);

    useEffectOnce(() => {
        setPage(getStartingPage(pagination, rowsPerPage));

        return () => {
            return resetSelection();
        };
    });

    const selectionResetHandler = useCallback(
        (override?: boolean) => {
            if (override ?? !keepSelectionOnFilterOrSearch) {
                resetSelection();
            }
        },
        [keepSelectionOnFilterOrSearch, resetSelection]
    );

    return { searchTextField, selectionResetHandler };
}
