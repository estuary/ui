import { TableColumns } from 'types';

import { ReactNode } from 'react';

import { SelectTableStoreNames } from 'stores/names';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}
