import { supabaseClient, TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { ConnectorTag, CONNECTOR_TAG_QUERY } from './shared';

function useConnectorTag(connectorImage: string | null) {
    const { data, error } = useQuery(
        hasLength(connectorImage)
            ? requiredConnectorColumnsExist(
                  supabaseClient
                      .from(TABLES.CONNECTOR_TAGS)
                      .select(CONNECTOR_TAG_QUERY)
                      .or(
                          `id.eq.${connectorImage},connector_id.eq.${connectorImage}`
                      )
              ).returns<ConnectorTag>()
            : null
    );

    return {
        connectorTag: data ?? null,
        error,
    };
}

export default useConnectorTag;
