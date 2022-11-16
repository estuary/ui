import { Box } from '@mui/material';
import { getLiveSpecs_materializations } from 'api/liveSpecsExt';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import Rows, { tableColumns } from 'components/tables/Materializations/Rows';
import { useMemo, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';

function MaterializationsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const query = useMemo(() => {
        return getLiveSpecs_materializations(
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
                    header: 'materializations.message1',
                    message: 'materializations.message2',
                }}
                columns={tableColumns}
                query={query}
                renderTableRows={(data, showEntityStatus) => (
                    <Rows data={data} showEntityStatus={showEntityStatus} />
                )}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="materializationsTable.title"
                filterLabel="materializationsTable.filterLabel"
                rowSelectorProps={{
                    selectableTableStoreName:
                        SelectTableStoreNames.MATERIALIZATION,
                }}
                showEntityStatus={true}
                enableSelection
                selectableTableStoreName={SelectTableStoreNames.MATERIALIZATION}
            />
        </Box>
    );
}

export default MaterializationsTable;
