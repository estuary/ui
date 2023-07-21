import { useMemo } from 'react';

import { useTenantDetails } from 'context/fetcher/Tenant';

import { QUERY_PARAM_CONNECTOR_TITLE } from 'services/supabase';

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
        field: QUERY_PARAM_CONNECTOR_TITLE,
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: 'writes_to',
        headerIntlKey: 'entityTable.data.writesTo',
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
                key={`captures-statsHeader-${index}`}
                header="entityTable.stats.written"
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
