import type { ConnectorsExist } from 'src/hooks/connectors/shared';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { CONNECTORS_EXIST_QUERY } from 'src/hooks/connectors/shared';
import { TABLES } from 'src/services/supabase';
import { requiredConnectorColumnsExist } from 'src/utils/connector-utils';

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
            ? requiredConnectorColumnsExist<ConnectorsExist[]>(
                  supabaseClient
                      .from(TABLES.CONNECTORS)
                      .select(CONNECTORS_EXIST_QUERY)
                      .eq('connector_tags.protocol', protocol),
                  'connector_tags'
              )
            : null
    );

    return useMemo(() => (data ? data.length > 0 : false), [data]);
}

export default useValidConnectorsExist;
