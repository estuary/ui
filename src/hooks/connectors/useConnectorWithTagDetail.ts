import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from './shared';

const defaultResponse: ConnectorWithTagDetailQuery[] = [];

function useConnectorWithTagDetail(
    protocol: string | null,
    connectorId?: string | null
) {
    const { data, error, mutate, isValidating } = useQuery(
        protocol
            ? connectorId
                ? supabaseClient
                      .from(TABLES.CONNECTORS)
                      .select(CONNECTOR_WITH_TAG_QUERY)
                      .eq('id', connectorId)
                      .returns<ConnectorWithTagDetailQuery[]>()
                : requiredConnectorColumnsExist(
                      supabaseClient
                          .from(TABLES.CONNECTORS)
                          .select(CONNECTOR_WITH_TAG_QUERY),
                      'connector_tags'
                  )
                      .eq('connector_tags.protocol', protocol)
                      .order(CONNECTOR_RECOMMENDED, { ascending: false })
                      .order(CONNECTOR_NAME)
                      .returns<ConnectorWithTagDetailQuery[]>()
            : null
    );

    return {
        connectorTags: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useConnectorWithTagDetail;
