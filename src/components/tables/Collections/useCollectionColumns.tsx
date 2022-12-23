import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
import StatsHeader from '../cells/stats/Header';
import { ColumnProps } from '../EntityTable';

const defaultColumns: ColumnProps[] = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: null,
        headerIntlKey: null,
    },
];

const statsHeader: ColumnProps = {
    field: null,
    renderHeader: (index, selectableTableStoreName) => {
        return (
            <StatsHeader
                key={`collection-statsHeader-${index}`}
                header="entityTable.stats.written"
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
            response.splice(1, 0, statsHeader);
            return response;
        } else {
            return defaultColumns;
        }
    }, [hasDetails]);
};

export default useCollectionColumns;
