import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
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
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

const writtenStatsHeader: ColumnProps = {
    field: null,
    cols: 2,
    renderHeader: (index, selectableTableStoreName) => {
        return (
            <StatsHeader
                key={`collection-writtenStatsHeader-${index}`}
                header="entityTable.stats.written"
                selectableTableStoreName={selectableTableStoreName}
            />
        );
    },
};

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
            const response = [...defaultColumns];
            response.splice(2, 0, writtenStatsHeader);
            response.splice(2, 0, readStatsHeader);
            return response;
        } else {
            return defaultColumns;
        }
    }, [hasDetails]);
};

export default useCollectionColumns;
