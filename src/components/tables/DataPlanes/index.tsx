import { getDataPlanesForTable } from 'api/dataPlanes';
import EntityTable from 'components/tables/EntityTable';
import { useDataPlaneScope } from 'context/DataPlaneScopeContext';
import { useMemo } from 'react';
import { DATA_PLANE_SETTINGS } from 'settings/dataPlanes';
import { SelectTableStoreNames } from 'stores/names';
import { TablePrefixes, useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { useTenantStore } from 'stores/Tenant/Store';
import Header from './Header';
import Rows from './Rows';
import { columns, selectableTableStoreName } from './shared';

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
    const { dataPlaneScope } = useDataPlaneScope();

    const formattedTenant = useMemo(() => {
        if (!selectedTenant) {
            return null;
        }

        return `${DATA_PLANE_SETTINGS[dataPlaneScope].prefix}${
            dataPlaneScope === 'private' ? selectedTenant : ''
        }`;
    }, [dataPlaneScope, selectedTenant]);

    const query = useMemo(() => {
        return formattedTenant
            ? getDataPlanesForTable(formattedTenant, pagination, searchQuery, [
                  {
                      col: columnToSort,
                      direction: sortDirection,
                  },
              ])
            : null;
    }, [columnToSort, formattedTenant, pagination, searchQuery, sortDirection]);

    return (
        <TableHydrator
            disableQueryParamHack
            query={query}
            selectableTableStoreName={SelectTableStoreNames.DATA_PLANE}
        >
            <EntityTable
                noExistingDataContentIds={{
                    header: `admin.dataPlanes.${dataPlaneScope}.table.noContent.header`,
                    message: `admin.dataPlanes.${dataPlaneScope}.table.noContent.message`,
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
                header={<Header />}
                filterLabel="admin.dataPlanes.table.filterLabel"
                selectableTableStoreName={selectableTableStoreName}
                tableAriaLabelKey="admin.dataPlanes.table.aria.label"
            />
        </TableHydrator>
    );
}

export default DataPlanesTable;
