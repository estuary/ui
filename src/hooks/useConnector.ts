import { TABLES } from 'services/supabase';

import { useQuery, useSelectSingle } from './supabase-swr/';

interface Connector {
    endpoint_spec_schema: string;
    id: string;
}

export const CONNECTOR_QUERY = `
    endpoint_spec_schema:connector_tags ( endpoint_spec_schema ),
    id
`;

function useConnector(id: string | null) {
    const connectorTagsQuery = useQuery<Connector>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_QUERY,
            filter: (query) => query.eq('id', id as string),
        },
        [id]
    );

    const { data, error } = useSelectSingle(id ? connectorTagsQuery : null);

    return {
        connector: data ? data.data : null,
        error,
    };
}

export default useConnector;
