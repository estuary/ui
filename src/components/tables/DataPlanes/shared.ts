import type { TableColumns } from 'src/types';

import { SelectTableStoreNames } from 'src/stores/names';

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'data.name',
    },
    {
        field: null, // not sortable
        headerIntlKey: 'data.ipv4',
    },
    {
        field: null, // not sortable
        headerIntlKey: 'data.ipv6',
    },
];
