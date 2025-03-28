import { ReactNode } from 'react';

import { SelectTableStoreNames } from 'src/stores/names';
import { TableColumns } from 'src/types';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}

export interface StandAloneTableTitleProps {
    titleIntlKey: string;
    docsUrl?: string;
    messageIntlKey?: string;
}
