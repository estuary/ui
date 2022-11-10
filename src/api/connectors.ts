import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import {
    CONNECTOR_NAME,
    defaultTableFilter,
    supabaseClient,
    TABLES,
} from 'services/supabase';

const getConnectors = (
    pagination: any,
    searchQuery: any,
    columnToSort: any,
    sortDirection: any
) => {
    let queryBuilder = supabaseClient
        .from<ConnectorWithTagDetailQuery>(TABLES.CONNECTORS)
        .select(CONNECTOR_WITH_TAG_QUERY, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<ConnectorWithTagDetailQuery>(
        queryBuilder,
        [CONNECTOR_NAME],
        searchQuery,
        columnToSort,
        sortDirection,
        pagination
    );

    return queryBuilder;
};

export { getConnectors };
