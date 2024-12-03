import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'admin.dataPlanes.table.columns.name',
    },
    {
        field: 'reactor_address',
        headerIntlKey: 'admin.dataPlanes.table.columns.reactor',
    },
    {
        field: 'cidr_blocks',
        headerIntlKey: 'admin.dataPlanes.table.columns.ips',
    },
];

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;
