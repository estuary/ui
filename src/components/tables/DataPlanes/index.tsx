import { getDataPlanesForTable } from 'api/dataPlanes';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { TablePrefixes, useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { useTenantStore } from 'stores/Tenant/Store';
import { TableColumns } from 'types';
import Rows from './Rows';

const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: 'admin.dataPlanes.table.columns.name',
    },
    {
        field: 'reactor_address',
        headerIntlKey: 'admin.dataPlanes.table.columns.reactor',
    },
    {
        field: null,
        headerIntlKey: 'admin.dataPlanes.table.columns.ips',
    },
];

const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

function DataPlanesTable() {
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
    } = useTableState(TablePrefixes.dataPlanes, 'data_plane_name', 'asc');

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const query = useMemo(() => {
        return selectedTenant
            ? getDataPlanesForTable(selectedTenant, pagination, searchQuery, [
                  {
                      col: columnToSort,
                      direction: sortDirection,
                  },
              ])
            : null;
    }, [columnToSort, pagination, searchQuery, selectedTenant, sortDirection]);

    return (
        <TableHydrator
            disableQueryParamHack
            query={query}
            selectableTableStoreName={SelectTableStoreNames.DATA_PLANE}
        >
            <EntityTable
                noExistingDataContentIds={{
                    header: 'admin.dataPlanes.table.noContent.header',
                    message: 'admin.dataPlanes.table.noContent.message',
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
                hideFilter
                filterLabel="admin.dataPlanes.table.filterLabel"
                selectableTableStoreName={selectableTableStoreName}
                tableAriaLabelKey="admin.dataPlanes.table.aria.label"
            />
        </TableHydrator>
    );
}

export default DataPlanesTable;
