import { supabaseClient, TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useMemo } from 'react';
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
