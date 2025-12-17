import type { TableColumns } from 'src/types';

import { SelectTableStoreNames } from 'src/stores/names';

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

export const columns: TableColumns[] = [
    { field: null, headerIntlKey: null, collapseHeader: true },
    { field: null, headerIntlKey: 'admin.dataPlanes.column.header.name' },
    { field: null, headerIntlKey: 'admin.dataPlanes.column.header.region' },
    { field: null, headerIntlKey: 'data.ipv4' },
];
