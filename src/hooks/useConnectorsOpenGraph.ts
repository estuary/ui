import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

export interface Connector {
    id: string;
    open_graph: object;
}

const QUERY_COLUMNS = ['id', 'open_graph'];

function useConnectorsOpenGraph(connectorId: string | null) {
    const draftSpecQuery = useQuery<Connector>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: QUERY_COLUMNS,
            filter: (query) => {
                let queryBuilder = query;

                if (connectorId) {
                    queryBuilder = queryBuilder.eq('id', connectorId);
                }

                return queryBuilder;
            },
        },
        [connectorId]
    );

    const { data, error, mutate } = useSelect(draftSpecQuery);

    return {
        connectorsOpenGraph: data ? data.data : [],
        error,
        mutate,
    };
}

export default useConnectorsOpenGraph;
