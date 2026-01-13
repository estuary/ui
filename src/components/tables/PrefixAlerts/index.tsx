import type { TableColumns } from 'src/types';

import { useMemo } from 'react';

import { getNotificationSubscriptionsForTable } from 'src/api/alerts';
import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import EntityTable from 'src/components/tables/EntityTable';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import { SelectTableStoreNames } from 'src/stores/names';
import { TablePrefixes, useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import { useTenantStore } from 'src/stores/Tenant/Store';

// TODO (optimization): The prefix alert table should have a last updated column
//   however the current data model does not provide a means to reliably track
//   when the emails subscribed to alerts under a given prefix were last updated.
//   If the most recently subscribed email for a given prefix is removed,
//   the latest `updated_at` value would be rolling back in time.
const columns: TableColumns[] = [
    {
        field: 'catalog_prefix',
        headerIntlKey: 'entityTable.data.catalogPrefix',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.alertTypes',
        width: 225,
    },
    {
        field: null,
        headerIntlKey: 'alerts.config.table.label.alertMethod',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
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
            selectableTableStoreName={SelectTableStoreNames.PREFIX_ALERTS}
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
