import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';
import { supabaseClient, TABLES } from 'services/supabase';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';
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
    const { data } = useQuery(
        protocol
            ? requiredConnectorColumnsExist(
                  supabaseClient
                      .from(TABLES.CONNECTORS)
                      .select(CONNECTORS_EXIST_QUERY),
                  'connector_tags'
              )
                  .eq('connector_tags.protocol', protocol)
                  .returns<ConnectorsExist[]>()
            : null
    );

    return useMemo(() => (data ? data.length > 0 : false), [data]);
}

export default useValidConnectorsExist;
