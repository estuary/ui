import { useMemo } from 'react';
import { TABLES } from 'services/supabase';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';
import { useQuery, useSelect } from '../supabase-swr';
import { ConnectorsExist, CONNECTORS_EXIST_QUERY } from './shared';

// TODO (connectors store) - this is temporary
// We used to check if connectors exist with a query that returned a bunch
//      of data and sorting. However, we then go and fetch that again a second
//      later. So this query is super small to reduce the amount of data and just
//      making sure there are connectors.
// We should just make a store that fetches all the needed connectors once
//      then always pull from that. The store could also cache the schemas, etc.
//      when the user selects a connector.
function useValidConnectorsExist(protocol: string | null) {
    const connectorTagsQuery = useQuery<ConnectorsExist>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTORS_EXIST_QUERY,
            filter: (query) =>
                requiredConnectorColumnsExist<ConnectorsExist>(
                    query,
                    'connector_tags'
                ).eq('connector_tags.protocol', protocol as string),
        },
        [protocol]
    );

    const { data } = useSelect(protocol ? connectorTagsQuery : null);

    return useMemo(
        () => (data?.data ? data.data.length > 0 : false),
        [data?.data]
    );
}

export default useValidConnectorsExist;
