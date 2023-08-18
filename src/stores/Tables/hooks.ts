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
    | 'pr' // prefixes
    | 'ali' // access links
    | 'sm' // storage mappings
    | 'cap' // captures
    | 'mat' // materializations
    | 'col' // collections
    | 'csl' // collections selector
    | 'con' // connectors
    | 'bil' // billing
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
            rowsPerPageKey: `${keyPrefix}-rpp`,
            searchQueryKey: `${keyPrefix}-sq`,
            sortDirectionKey: `${keyPrefix}-sdir`,
            sortColumnKey: `${keyPrefix}-scol`,
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

    return useMemo(() => {
        return {
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
