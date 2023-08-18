import { useCallback, useMemo } from 'react';
import { SortDirection } from 'types';
import {
    JsonParam,
    NumberParam,
    StringParam,
    useQueryParams,
    withDefault,
} from 'use-query-params';
import { getPagination } from '../../components/tables/EntityTable';

export type TablePrefix =
    | 'ag' // access grants
    | 'ali' // access links
    | 'bil' // billing
    | 'cap' // captures
    | 'col' // collections
    | 'con' // connectors
    | 'csl' // collections selector
    | 'mat' // materializations
    | 'pr' // prefixes
    | 'sm' // storage mappings
    | 'sv'; // schema viewer

function useTableState(
    keyPrefix: TablePrefix,
    defaultSortCol: any,
    defaultSortDir?: SortDirection,
    defaultPage?: number
) {
    const {
        paginationKey,
        rowsPerPageKey,
        searchQueryKey,
        sortDirectionKey,
        sortColumnKey,
    } = useMemo(() => {
        return {
            paginationKey: `${keyPrefix}-p`,
            rowsPerPageKey: `${keyPrefix}-r`,
            searchQueryKey: `${keyPrefix}-s`,
            sortDirectionKey: `${keyPrefix}-d`,
            sortColumnKey: `${keyPrefix}-c`,
        };
    }, [keyPrefix]);

    const [query, setQuery] = useQueryParams({
        [rowsPerPageKey]: withDefault(NumberParam, defaultPage ?? 10),
        [sortColumnKey]: withDefault(StringParam, defaultSortCol),
        [sortDirectionKey]: withDefault(StringParam, defaultSortDir ?? 'asc'),
        [searchQueryKey]: withDefault(StringParam, null),
        [paginationKey]: withDefault(
            JsonParam,
            getPagination(0, defaultPage ?? 10)
        ),
    });

    const setPagination = useCallback(
        (val: any) => {
            console.log('setPagination', val);
            setQuery({ [paginationKey]: val });
        },
        [paginationKey, setQuery]
    );

    const setRowsPerPage = useCallback(
        (val: any) => {
            console.log('setRowsPerPage', val);
            setQuery({ [rowsPerPageKey]: val });
        },
        [rowsPerPageKey, setQuery]
    );

    const setSearchQuery = useCallback(
        (val: any) => {
            console.log('setSearchQuery', val);

            setQuery({ [searchQueryKey]: val });
        },
        [searchQueryKey, setQuery]
    );

    const setSortDirection = useCallback(
        (val: any) => {
            console.log('setSortDirection', val);

            setQuery({ [sortDirectionKey]: val });
        },
        [sortDirectionKey, setQuery]
    );

    const setColumnToSort = useCallback(
        (val: any) => {
            console.log('setColumnToSort', val);

            setQuery({ [sortColumnKey]: val });
        },
        [sortColumnKey, setQuery]
    );

    const reset = useCallback(() => {
        setPagination(null);
        setRowsPerPage(null);
        setSearchQuery(null);
        setSortDirection(null);
        setColumnToSort(null);
    }, [
        setColumnToSort,
        setPagination,
        setRowsPerPage,
        setSearchQuery,
        setSortDirection,
    ]);

    return useMemo(() => {
        return {
            reset,
            pagination: query[paginationKey],
            setPagination,
            rowsPerPage: query[rowsPerPageKey],
            setRowsPerPage,
            searchQuery: query[searchQueryKey],
            setSearchQuery,
            sortDirection: query[sortDirectionKey] as SortDirection,
            setSortDirection,
            columnToSort: query[sortColumnKey],
            setColumnToSort,
        };
    }, [
        reset,
        paginationKey,
        query,
        rowsPerPageKey,
        searchQueryKey,
        setColumnToSort,
        setPagination,
        setRowsPerPage,
        setSearchQuery,
        setSortDirection,
        sortColumnKey,
        sortDirectionKey,
    ]);
}

export { useTableState };
