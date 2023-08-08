import { useCallback, useMemo } from 'react';
import { SortDirection } from 'types';
import {
    JsonParam,
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
    defaultSortDir?: SortDirection
) {
    const { paginationKey, searchQueryKey, sortDirectionKey, sortColumnKey } =
        useMemo(() => {
            return {
                paginationKey: `${keyPrefix}-p`,
                searchQueryKey: `${keyPrefix}-sq`,
                sortDirectionKey: `${keyPrefix}-sdir`,
                sortColumnKey: `${keyPrefix}-scol`,
            };
        }, [keyPrefix]);

    const [query, setQuery] = useQueryParams({
        [sortColumnKey]: withDefault(StringParam, defaultSortCol),
        [sortDirectionKey]: withDefault(StringParam, defaultSortDir ?? 'asc'),
        [searchQueryKey]: withDefault(StringParam, null),
        [paginationKey]: withDefault(JsonParam, getPagination(0, 10)),
    });

    const setPagination = useCallback(
        (val: any) => {
            setQuery({ [paginationKey]: val });
        },
        [paginationKey, setQuery]
    );

    const setSearchQuery = useCallback(
        (val: any) => {
            setQuery({ [searchQueryKey]: val });
        },
        [searchQueryKey, setQuery]
    );

    const setSortDirection = useCallback(
        (val: any) => {
            setQuery({ [sortDirectionKey]: val });
        },
        [sortDirectionKey, setQuery]
    );

    const setColumnToSort = useCallback(
        (val: any) => {
            setQuery({ [sortColumnKey]: val });
        },
        [sortColumnKey, setQuery]
    );

    return useMemo(() => {
        return {
            pagination: query[paginationKey],
            setPagination,
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
        searchQueryKey,
        setColumnToSort,
        setPagination,
        setSearchQuery,
        setSortDirection,
        sortColumnKey,
        sortDirectionKey,
    ]);
}

export { useTableState };
