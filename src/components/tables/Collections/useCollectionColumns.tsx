import { useMemo } from 'react';
import StatsHeader from '../cells/stats/Header';
import { ColumnProps } from '../EntityTable/types';

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
