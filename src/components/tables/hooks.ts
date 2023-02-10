import { useCallback } from 'react';
import { SortDirection } from 'types';
import {
    JsonParam,
    StringParam,
    useQueryParams,
    withDefault,
} from 'use-query-params';
import { getPagination } from './EntityTable';

function useTableState(defaultSortCol: any, defaultSortDir?: SortDirection) {
    const rowsPerPage = 10;
    const [query, setQuery] = useQueryParams({
        sortColumn: withDefault(StringParam, defaultSortCol),
        sortDirection: withDefault(StringParam, defaultSortDir ?? 'asc'),
        searchQuery: withDefault(StringParam, null),
        pagination: withDefault(JsonParam, getPagination(0, rowsPerPage)),
    });

    const setPagination = useCallback(
        (val: any) => {
            setQuery({ pagination: val });
        },
        [setQuery]
    );

    const setSearchQuery = useCallback(
        (val: any) => {
            setQuery({ searchQuery: val });
        },
        [setQuery]
    );

    const setSortDirection = useCallback(
        (val: any) => {
            setQuery({ sortDirection: val });
        },
        [setQuery]
    );

    const setColumnToSort = useCallback(
        (val: any) => {
            setQuery({ sortColumn: val });
        },
        [setQuery]
    );

    return {
        pagination: query.pagination,
        setPagination,
        searchQuery: query.searchQuery,
        setSearchQuery,
        sortDirection: query.sortDirection as SortDirection,
        setSortDirection,
        columnToSort: query.sortColumn,
        setColumnToSort,
    };
}

export default useTableState;
