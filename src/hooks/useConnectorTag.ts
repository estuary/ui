import { TABLES } from 'services/supabase';
import { useQuery, useSelectSingle } from './supabase-swr/';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    endpoint_spec_schema: string;
    resource_spec_schema: string;
    documentation_url: string;
}

export const CONNECTOR_TAG_QUERY = `
    connectors(
        image_name
    ),
    id,
    endpoint_spec_schema, 
    resource_spec_schema, 
    documentation_url
`;

function useConnectorTag(connectorImage: string | null) {
    const connectorTagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('id', connectorImage as string),
        },
        [connectorImage]
    );

    const { data, error } = useSelectSingle(
        connectorImage ? connectorTagsQuery : null
    );

    return {
        connectorTag: data ? data.data : null,
        error,
    };
}

export default useConnectorTag;
