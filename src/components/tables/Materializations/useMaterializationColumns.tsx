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
        headerIntlKey: 'data.type',
    },
    {
        field: 'reads_from',
        headerIntlKey: 'entityTable.data.readsFrom',
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
                key={`materializations-statsHeader-${index}`}
                header="entityTable.stats.read"
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
