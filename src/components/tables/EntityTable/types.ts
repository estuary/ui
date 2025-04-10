import type { ReactNode } from 'react';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { TableColumns } from 'src/types';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
    renderFooHeader?: (index: number) => ReactNode;
}

export interface StandAloneTableTitleProps {
    titleIntlKey: string;
    docsUrl?: string;
    messageIntlKey?: string;
}
