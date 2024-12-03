import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'admin.dataPlanes.table.columns.name',
        collapseHeader: true,
    },
    {
        field: 'reactor_address',
        headerIntlKey: 'admin.dataPlanes.table.columns.reactor',
        collapseHeader: true,
    },
    {
        field: 'cidr_blocks',
        headerIntlKey: 'admin.dataPlanes.table.columns.ips',
    },
];

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;
