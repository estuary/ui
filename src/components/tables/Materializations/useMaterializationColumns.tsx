import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
import StatsHeader from '../cells/stats/Header';
import { ColumnProps } from '../EntityTable/types';
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
    readsFrom,
    lastPublished,
    {
        field: null,
        headerIntlKey: null,
        collapseHeader: true,
    },
];

const statsHeader: ColumnProps = {
    field: null,
    cols: 2,
    renderHeader: (index, selectableTableStoreName) => {
        return (
            <StatsHeader
                key={`materializations-statsHeader-${index}`}
                headerSuffix="data.read"
                selectableTableStoreName={selectableTableStoreName}
            />
        );
    },
};

const useMaterializationColumns = (): ColumnProps[] => {
    const tenantDetails = useTenantDetails();

    const hasDetails = useMemo(() => hasLength(tenantDetails), [tenantDetails]);

    return useMemo(() => {
        if (hasDetails) {
            const response = [...defaultColumns];
            response.splice(3, 0, statsHeader);
            return response;
        } else {
            return defaultColumns;
        }
    }, [hasDetails]);
};

export default useMaterializationColumns;
