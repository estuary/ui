import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'services/supabase';
import { connectorHasRequiredColumns } from 'utils/connector-utils';
import { useQuery, useSelect } from '../supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from './shared';

const defaultResponse: ConnectorWithTagDetailQuery[] = [];

function useConnectorWithTagDetail(
    protocol: string | null,
    connectorId?: string | null
) {
    const connectorTagsQuery = useQuery<ConnectorWithTagDetailQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_WITH_TAG_QUERY,
            filter: (query) =>
                connectorId
                    ? query.eq('id', connectorId)
                    : connectorHasRequiredColumns<ConnectorWithTagDetailQuery>(
                          query,
                          'connector_tags'
                      )
                          .eq('connector_tags.protocol', protocol as string)
                          .order(CONNECTOR_RECOMMENDED, { ascending: false })
                          .order(CONNECTOR_NAME),
        },
        [protocol]
    );

    const { data, error, mutate, isValidating } = useSelect(
        protocol ? connectorTagsQuery : null
    );

    return {
        connectorTags: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useConnectorWithTagDetail;
