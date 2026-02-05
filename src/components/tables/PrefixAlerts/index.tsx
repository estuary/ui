import { useMemo } from 'react';

import { getNotificationSubscriptionsForTable } from 'src/api/alerts';
import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import EntityTable from 'src/components/tables/EntityTable';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import {
    columns,
    selectableTableStoreName,
} from 'src/components/tables/PrefixAlerts/shared';
import { TablePrefixes, useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import { useTenantStore } from 'src/stores/Tenant/Store';

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
    } = useTableState(TablePrefixes.prefixAlerts, 'catalog_prefix', 'asc');

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const query = useMemo(() => {
        return selectedTenant
            ? getNotificationSubscriptionsForTable(
                  selectedTenant,
                  pagination,
                  searchQuery,
                  [
                      {
                          col: columnToSort,
                          direction: sortDirection,
                      },
                  ]
              )
            : null;
    }, [columnToSort, pagination, searchQuery, selectedTenant, sortDirection]);

    return (
        <TableHydrator
            disableQueryParamHack
            query={query}
            selectableTableStoreName={selectableTableStoreName}
        >
            <EntityTable
                columns={columns}
                columnToSort={columnToSort}
                filterLabel="alerts.config.table.filterLabel"
                header={null}
                noExistingDataContentIds={{
                    header: 'alerts.config.table.noContent.header',
                    message: 'alerts.config.table.noContent.message',
                    disableDoclink: true,
                }}
                pagination={pagination}
                renderTableRows={(data) => <Rows data={data} />}
                rowsPerPage={rowsPerPage}
                searchQuery={searchQuery}
                selectableTableStoreName={selectableTableStoreName}
                setColumnToSort={setColumnToSort}
                setPagination={setPagination}
                setRowsPerPage={setRowsPerPage}
                setSearchQuery={setSearchQuery}
                setSortDirection={setSortDirection}
                showToolbar
                sortDirection={sortDirection}
                tableAriaLabelKey="alerts.config.table.aria.label"
                toolbar={<AlertGenerateButton />}
            />
        </TableHydrator>
    );
}

export default PrefixAlertTable;
