import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'data.name',
        collapseHeader: true,
    },
    {
        field: null,
        headerIntlKey: 'data.serviceAccount',
        collapseHeader: true,
    },
    {
        field: 'reactor_address',
        headerIntlKey: 'data.reactor',
        collapseHeader: true,
    },
    {
        field: 'cidr_blocks',
        headerIntlKey: 'data.cidr',
    },
];
