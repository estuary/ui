import type { ColumnProps } from 'src/components/tables/EntityTable/types';

import { useMemo } from 'react';

import StatsHeader from 'src/components/tables/cells/stats/Header';
import {
    catalogName,
    connectorType,
    lastPublished,
    readsFrom,
} from 'src/components/tables/shared';

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
