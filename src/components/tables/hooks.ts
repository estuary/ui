import { useState } from 'react';
import { SortDirection } from 'types';
import { getPagination } from './EntityTable';

function useTableState(defaultSortCol: any, defaultSortDir?: SortDirection) {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(
        defaultSortDir ?? 'asc'
    );
    const [columnToSort, setColumnToSort] = useState<any>(defaultSortCol);

    return {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    };
}

export default useTableState;
