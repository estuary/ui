import { TABLES } from 'services/supabase';
import { OpenGraph } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

export interface ConnectorTagQuery {
    connectors: {
        detail: string;
        image_name: string;
        open_graph: OpenGraph;
    };
    id: string;
    connector_id: string;
    image_tag: string;
    protocol: string;
    title: string;
}
export const CONNECTOR_TAG_QUERY = `
    id,
    connector_id,
    image_tag,
    protocol,
    endpoint_spec_schema->>title,
    connectors(detail, image_name, open_graph)
`;

function useConnectorTags(protocol: string | null) {
    const connectorTagsQuery = useQuery<ConnectorTagQuery>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('protocol', protocol as string),
        },
        [protocol]
    );

    const { data, error, mutate, isValidating } = useSelect(
        protocol ? connectorTagsQuery : null
    );

    return {
        connectorTags: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useConnectorTags;
