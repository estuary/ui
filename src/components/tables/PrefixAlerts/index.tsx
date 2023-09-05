import { Box } from '@mui/material';
import { getPrefixAlertMethod } from 'api/alerts';
import EntityTable from 'components/tables/EntityTable';
import Rows from 'components/tables/PrefixAlerts/Rows';
import RowSelector from 'components/tables/RowActions/PrefixAlerts/RowSelector';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import StatsHydrator from 'stores/Tables/StatsHydrator';
import { TableColumns } from 'types';

const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'prefix',
        headerIntlKey: 'entityTable.data.catalogPrefix',
    },
    {
        field: 'email',
        headerIntlKey: 'admin.alerts.table.label.alertMethod',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

const selectableTableStoreName = SelectTableStoreNames.PREFIX_ALERTS;

function PrefixAlertTable() {
    const {
        pagination,
        setPagination,
        rowsPerPage,
        setRowsPerPage,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('pal', 'updated_at', 'desc');

    const query = useMemo(() => {
        return getPrefixAlertMethod(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={selectableTableStoreName}
            >
                <StatsHydrator
                    selectableTableStoreName={selectableTableStoreName}
                >
                    <EntityTable
                        noExistingDataContentIds={{
                            header: 'admin.alerts.table.noContent.header',
                            message: 'admin.alerts.table.noContent.message',
                            disableDoclink: true,
                        }}
                        columns={columns}
                        renderTableRows={(data) => <Rows data={data} />}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        pagination={pagination}
                        setPagination={setPagination}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        columnToSort={columnToSort}
                        setColumnToSort={setColumnToSort}
                        header={null}
                        filterLabel="admin.alerts.table.filterLabel"
                        selectableTableStoreName={selectableTableStoreName}
                        showToolbar
                        toolbar={
                            <RowSelector
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                            />
                        }
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default PrefixAlertTable;
