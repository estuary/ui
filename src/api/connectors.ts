import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import {
    CONNECTOR_NAME,
    defaultTableFilter,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';

const getConnectors = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
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
        sorting,
        pagination
    );

    return queryBuilder;
};

export { getConnectors };
