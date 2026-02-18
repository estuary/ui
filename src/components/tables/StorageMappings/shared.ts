import type { SelectableTableStore } from 'src/stores/Tables/Store';
import type { TableColumns } from 'src/types';

import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

export function useStorageMappingsRefresh() {
    return useZustandStore<
        SelectableTableStore,
        SelectableTableStore['incrementSuccessfulTransformations']
    >(
        SelectTableStoreNames.STORAGE_MAPPINGS,
        selectableTableStoreSelectors.successfulTransformations.increment
    );
}

export const tableColumns: TableColumns[] = [
    {
        field: 'catalog_prefix',
        headerIntlKey: 'entityTable.data.catalogPrefix',
    },
    {
        field: null,
        headerIntlKey: 'data.status',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.dataPlanes',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.provider',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.bucket',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.storagePrefix',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];
