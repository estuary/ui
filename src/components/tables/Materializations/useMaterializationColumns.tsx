import { useMemo } from 'react';
import StatsHeader from '../cells/stats/Header';
import type { ColumnProps } from '../EntityTable/types';
import {
    catalogName,
    connectorType,
    lastPublished,
    readsFrom,
} from '../shared';

const defaultColumns: ColumnProps[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    catalogName,
    connectorType,
    {
        field: null,
        cols: 2,
        renderHeader: (index, selectableTableStoreName) => {
            return (
                <StatsHeader
                    key={`materializations-statsHeader-${index}`}
                    firstHeaderSuffix="data.read"
                    selectableTableStoreName={selectableTableStoreName}
                />
            );
        },
    },
    readsFrom,
    lastPublished,
    {
        field: null,
        headerIntlKey: null,
        collapseHeader: true,
    },
];

const useMaterializationColumns = (): ColumnProps[] => {
    return useMemo(() => defaultColumns, []);
};

export default useMaterializationColumns;
