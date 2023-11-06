import { getNotificationSubscriptionsForTable } from 'api/alerts';
import EntityTable from 'components/tables/EntityTable';
import Rows from 'components/tables/PrefixAlerts/Rows';
import RowSelector from 'components/tables/RowActions/PrefixAlerts/RowSelector';
import { useMemo } from 'react';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { SelectTableStoreNames } from 'stores/names';
import { TablePrefixes, useTableState } from 'stores/Tables/hooks';
import PrefixAlertTableHydrator from 'stores/Tables/PrefixAlerts/Hydrator';
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
        field: null,
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
    } = useTableState(TablePrefixes.prefixAlerts, 'updated_at', 'desc');

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const query = useMemo(() => {
        return getNotificationSubscriptionsForTable(
            pagination,
            searchQuery,
            [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ],
            objectRoles
        );
    }, [columnToSort, objectRoles, pagination, searchQuery, sortDirection]);

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
                toolbar={
                    <RowSelector
                        selectableTableStoreName={selectableTableStoreName}
                    />
                }
            />
        </PrefixAlertTableHydrator>
    );
}

export default PrefixAlertTable;
