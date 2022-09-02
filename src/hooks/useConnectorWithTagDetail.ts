import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'services/supabase';
import { ENTITY_WITH_CREATE, OpenGraph } from 'types';
import { useQuery, useSelect } from './supabase-swr';

export interface ConnectorWithTagDetailQuery {
    connector_tags: {
        documentation_url: string;
        protocol: ENTITY_WITH_CREATE;
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
    ['connector_tags.image_tag']: undefined;
    [CONNECTOR_NAME]: undefined;
    [CONNECTOR_RECOMMENDED]: undefined;
}

export const CONNECTOR_WITH_TAG_QUERY = `
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
                    : query
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
        connectorTags: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useConnectorWithTagDetail;
