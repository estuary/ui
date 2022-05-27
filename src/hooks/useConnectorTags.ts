import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'services/supabase';
import { OpenGraph } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

export interface ConnectorTagQuery {
    connector_tags: {
        documentation_url: string;
        protocol: string;
        image_tag: string;
        image_name: string;
        id: string;
        title: string;
    }[];
    id: string;
    detail: string;
    updated_at: string;
    image_name: string;
    image: OpenGraph['image'];
    recommended: OpenGraph['image'];
    title: OpenGraph['title'];
    // FILTERING TYPES HACK
    ['connector_tags.protocol']: undefined;
    [CONNECTOR_NAME]: undefined;
    [CONNECTOR_RECOMMENDED]: undefined;
}

const CONNECTOR_QUERY = `
    id,
    detail,
    updated_at,
    image_name,
    open_graph->en-US->>image,
    ${CONNECTOR_RECOMMENDED},
    ${CONNECTOR_NAME},
    connector_tags !inner(
        documentation_url,
        protocol,
        image_tag,
        id,
        endpoint_spec_schema->>title
    )
`;

function useConnectorTags(protocol: string | null) {
    const connectorTagsQuery = useQuery<ConnectorTagQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_QUERY,
            filter: (query) =>
                query
                    .eq('connector_tags.protocol', protocol as string)
                    .order(CONNECTOR_RECOMMENDED)
                    .order(CONNECTOR_NAME),
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
