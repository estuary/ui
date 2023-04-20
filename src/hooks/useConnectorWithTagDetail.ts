import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'services/supabase';
import { EntityWithCreateWorkflow } from 'types';
import { useQuery, useSelect } from './supabase-swr';

export interface ConnectorWithTagDetailQuery {
    connector_tags: {
        connector_id: string;
        documentation_url: string;
        id: string;
        image_name: string;
        image_tag: string;
        protocol: EntityWithCreateWorkflow;
        title: string;
    }[];
    detail: string;
    id: string;
    image: string;
    image_name: string;
    recommended: boolean;
    title: string;
    updated_at: string;
    // FILTERING TYPES HACK
    // eslint-disable-next-line typescript-sort-keys/interface
    [CONNECTOR_NAME]: undefined;
    ['connector_tags.image_tag']: undefined;
    ['connector_tags.protocol']: undefined;
}

export const CONNECTOR_WITH_TAG_QUERY = `
    id,
    detail,
    updated_at,
    image_name,
    image:logo_url->>en-US::text,
    ${CONNECTOR_RECOMMENDED},
    title:${CONNECTOR_NAME}::text,
    connector_tags !inner(
        documentation_url,
        protocol,
        image_tag,
        id,
        connector_id,
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
