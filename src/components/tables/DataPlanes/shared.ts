import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'data.name',
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

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;
