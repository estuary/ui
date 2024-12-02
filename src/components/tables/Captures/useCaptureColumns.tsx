import { useMemo } from 'react';
import StatsHeader from '../cells/stats/Header';
import { ColumnProps } from '../EntityTable/types';
import { catalogName, connectorType, lastPublished, writesTo } from '../shared';

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
                    key={`captures-statsHeader-${index}`}
                    firstHeaderSuffix="data.written"
                    selectableTableStoreName={selectableTableStoreName}
                />
            );
        },
    },
    writesTo,
    lastPublished,
    {
        field: null,
        headerIntlKey: null,
        collapseHeader: true,
    },
];

const useCaptureColumns = (): ColumnProps[] => {
    return useMemo(() => defaultColumns, []);
};

export default useCaptureColumns;
