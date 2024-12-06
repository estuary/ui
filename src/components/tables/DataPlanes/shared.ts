import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'data.name',
    },
    {
        field: null, // This is null because this column shows 2 columns data in a single one
        headerIntlKey: 'data.serviceAccount',
    },
    {
        field: 'reactor_address',
        headerIntlKey: 'data.reactor',
    },
    {
        field: 'cidr_blocks',
        headerIntlKey: 'data.cidr',
    },
];
