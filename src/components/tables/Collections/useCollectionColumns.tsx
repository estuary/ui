import { useMemo } from 'react';

import StatsHeader from 'src/components/tables/cells/stats/Header';
import type { ColumnProps } from 'src/components/tables/EntityTable/types';

const defaultColumns: ColumnProps[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
        cols: 2,
        renderHeader: (index, selectableTableStoreName) => {
            return (
                <StatsHeader
                    hideFilter
                    key={`collection-docsStatsHeader-${index}`}
                    header="data.data"
                    firstHeaderSuffix="data.in"
                    secondHeaderSuffix="data.out"
                    selectableTableStoreName={selectableTableStoreName}
                />
            );
        },
    },
    {
        field: null,
        cols: 2,
        renderHeader: (index, selectableTableStoreName) => {
            return (
                <StatsHeader
                    key={`collection-docsStatsHeader-${index}`}
                    header="data.docs"
                    firstHeaderSuffix="data.in"
                    secondHeaderSuffix="data.out"
                    selectableTableStoreName={selectableTableStoreName}
                />
            );
        },
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

const useCollectionColumns = (): ColumnProps[] => {
    return useMemo(() => defaultColumns, []);
};

export default useCollectionColumns;
