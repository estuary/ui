import { ReactNode } from 'react';

import { TableColumns } from 'types';

import { SelectTableStoreNames } from 'stores/names';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}
