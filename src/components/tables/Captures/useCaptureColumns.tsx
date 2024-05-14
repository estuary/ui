import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
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
    writesTo,
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
                key={`captures-statsHeader-${index}`}
                headerSuffix="data.written"
                selectableTableStoreName={selectableTableStoreName}
            />
        );
    },
};

const useCaptureColumns = (): ColumnProps[] => {
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

export default useCaptureColumns;
