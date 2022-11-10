import { Box } from '@mui/material';
import { getGrantsForEverything } from 'api/combinedGrantsExt';
import Rows, { tableColumns } from 'components/tables/AccessGrants/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { useMemo, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';

function AccessGrantsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState<any>('user_full_name');

    const query = useMemo(() => {
        return getGrantsForEverything(
            pagination,
            searchQuery,
            columnToSort,
            sortDirection
        );
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'accessGrants.message1',
                    message: 'accessGrants.message2',
                    disableDoclink: true,
                }}
                columns={tableColumns}
                query={query}
                renderTableRows={(data) => <Rows data={data} />}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="accessGrantsTable.title"
                filterLabel="accessGrantsTable.filterLabel"
                selectableTableStoreName={SelectTableStoreNames.ACCESS_GRANTS}
            />
        </Box>
    );
}

export default AccessGrantsTable;
