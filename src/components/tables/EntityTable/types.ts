import { ReactNode } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { TableColumns } from 'types';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}
