import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'services/supabase';
import { CONNECTOR_TYPES, OpenGraph } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

export interface ConnectorTagQuery {
    id: string;
    connector_id: string;
    image_tag: string;
    protocol: CONNECTOR_TYPES;
    title: string;
    connectors: {
        detail: string;
        image_name: string;
        image: OpenGraph['image'];
        recommended: OpenGraph['recommended'];
        title: OpenGraph['title'];
    };
    // !!! FILTERS ONLY !!!
    [CONNECTOR_RECOMMENDED]: string;
    [CONNECTOR_NAME]: string;
}

export const CONNECTOR_TAG_QUERY = `
    id,
    connector_id,
    image_tag,
    protocol,
    endpoint_spec_schema->>title,
    connectors(
        detail,
        image_name,
        open_graph->en-US->>image,
        ${CONNECTOR_RECOMMENDED},
        ${CONNECTOR_NAME}
    )
`;

function useConnectorTags(protocol: string | null) {
    const connectorTagsQuery = useQuery<ConnectorTagQuery>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('protocol', protocol as string),
            // .order('open_graph->en-US->>recommended', {
            //     ascending: true,
            //     foreignTable: 'connectors',
            // })
            // .order(CONNECTOR_NAME, {
            //     ascending: true,
            //     foreignTable: 'connectors',
            // }),
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
