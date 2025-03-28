import { TABLES } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';
import { requiredConnectorColumnsExist } from 'src/utils/connector-utils';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';
import { supabaseClient } from 'src/context/GlobalProviders';
import { ConnectorTag, CONNECTOR_TAG_QUERY } from './shared';

function useConnectorTag(connectorImage: string | null) {
    const query = useMemo(() => {
        if (!hasLength(connectorImage)) {
            return null;
        }

        return requiredConnectorColumnsExist<ConnectorTag>(
            supabaseClient
                .from(TABLES.CONNECTOR_TAGS)
                .select(CONNECTOR_TAG_QUERY)
                .or(`id.eq.${connectorImage},connector_id.eq.${connectorImage}`)
                .single()
        );
    }, [connectorImage]);

    const { data, error } = useQuery(query);

    return {
        connectorTag: data ?? null,
        error,
    };
}

export default useConnectorTag;
