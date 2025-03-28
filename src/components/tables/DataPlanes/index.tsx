import { getDataPlanesForTable } from 'src/api/dataPlanes';
import EntityTable from 'src/components/tables/EntityTable';
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';
import { useMemo } from 'react';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { TablePrefixes, useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import { useTenantStore } from 'src/stores/Tenant/Store';
import ToggleDataPlaneScope from './ToggleDataPlaneScope';
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

    const dataPlaneName = useMemo(() => {
        if (!selectedTenant) {
            return null;
        }

        return `${DATA_PLANE_SETTINGS[dataPlaneScope].prefix}${
            dataPlaneScope === 'private' ? selectedTenant : ''
        }`;
    }, [dataPlaneScope, selectedTenant]);

    const query = useMemo(() => {
        return dataPlaneName
            ? getDataPlanesForTable(dataPlaneName, pagination, searchQuery, [
                  {
                      col: columnToSort,
                      direction: sortDirection,
                  },
              ])
            : null;
    }, [columnToSort, dataPlaneName, pagination, searchQuery, sortDirection]);

    return (
        <TableHydrator
            disableQueryParamHack
            query={query}
            selectableTableStoreName={selectableTableStoreName}
        >
            <EntityTable
                noExistingDataContentIds={
                    DATA_PLANE_SETTINGS[dataPlaneScope].table
                        .noExistingDataContentIds
                }
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
                filterLabel={
                    DATA_PLANE_SETTINGS[dataPlaneScope].table.filterIntlKey
                }
                selectableTableStoreName={selectableTableStoreName}
                tableAriaLabelKey="admin.dataPlanes.table.aria.label"
                showToolbar
                toolbar={<ToggleDataPlaneScope />}
            />
        </TableHydrator>
    );
}

export default DataPlanesTable;
