import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
import StatsHeader from '../cells/stats/Header';
import { ColumnProps } from '../EntityTable/types';

const defaultColumnsStart: ColumnProps[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
];

const defaultColumnsEnd: ColumnProps[] = [
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

const writtenStatsHeader: ColumnProps[] = [
    {
        field: null,
        headerIntlKey: 'entityTable.stats.written',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.written.docs',
    },
];

const readStatsHeader: ColumnProps = {
    field: null,
    cols: 2,
    renderHeader: (index, selectableTableStoreName) => {
        return (
            <StatsHeader
                key={`collection-readStatsHeader-${index}`}
                header="entityTable.stats.read"
                selectableTableStoreName={selectableTableStoreName}
            />
        );
    },
};

const useCollectionColumns = (): ColumnProps[] => {
    const tenantDetails = useTenantDetails();

    const hasDetails = useMemo(() => hasLength(tenantDetails), [tenantDetails]);

    return useMemo(() => {
        if (hasDetails) {
            return [
                ...defaultColumnsStart,
                ...writtenStatsHeader,
                readStatsHeader,
                ...defaultColumnsEnd,
            ];
        } else {
            return [...defaultColumnsStart, ...defaultColumnsEnd];
        }
    }, [hasDetails]);
};

export default useCollectionColumns;
