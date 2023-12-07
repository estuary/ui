import { getNotificationSubscriptionsForTable } from 'api/alerts';
import AlertGenerateButton from 'components/admin/Settings/PrefixAlerts/GenerateButton';
import EntityTable from 'components/tables/EntityTable';
import Rows from 'components/tables/PrefixAlerts/Rows';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { TablePrefixes, useTableState } from 'stores/Tables/hooks';
import PrefixAlertTableHydrator from 'stores/Tables/PrefixAlerts/Hydrator';
import { TableColumns } from 'types';

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
        headerIntlKey: 'admin.alerts.table.label.alertMethod',
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

    const query = useMemo(() => {
        return getNotificationSubscriptionsForTable(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <PrefixAlertTableHydrator query={query}>
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
                toolbar={<AlertGenerateButton />}
            />
        </PrefixAlertTableHydrator>
    );
}

export default PrefixAlertTable;
