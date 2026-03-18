import type { SortDirection } from 'src/types';

import { useCallback, useMemo } from 'react';
import {
    JsonParam,
    NumberParam,
    StringParam,
    useQueryParams,
    withDefault,
} from 'use-query-params';

import { getPagination } from 'src/utils/table-utils';

export enum TableFilterKeys {
    pagination = 'p',
    rowsPerPage = 'r',
    searchQuery = 's',
    sortColumn = 'c',
    sortDirection = 'd',
}

export enum TablePrefixes {
    accessGrants = 'ag',
    accessLinks = 'ali',
    alertHistoryForTenant = 'tah',
    alertHistoryForEntity = 'eah',
    alertsForEntity = 'aah',
    billing = 'bil',
    captures = 'cap',
    collections = 'col',
    connectors = 'con',
    dataPlanes = 'dpt',
    entitySelector = 'esl',
    fieldSelection = 'fs',
    materializations = 'mat',
    prefixes = 'pr',
    prefixAlerts = 'pal',
    refreshTokens = 'rt',
    schemaViewer = 'sv',
    storageMappings = 'sm',
}
export type TablePrefix = `${TablePrefixes}`;

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
            paginationKey: `${keyPrefix}-${TableFilterKeys.pagination}`,
            rowsPerPageKey: `${keyPrefix}-${TableFilterKeys.rowsPerPage}`,
            searchQueryKey: `${keyPrefix}-${TableFilterKeys.searchQuery}`,
            sortDirectionKey: `${keyPrefix}-${TableFilterKeys.sortDirection}`,
            sortColumnKey: `${keyPrefix}-${TableFilterKeys.sortColumn}`,
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
            setQuery({ [paginationKey]: val });
        },
        [paginationKey, setQuery]
    );

    const setRowsPerPage = useCallback(
        (val: any) => {
            setQuery({ [rowsPerPageKey]: val });
        },
        [rowsPerPageKey, setQuery]
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
