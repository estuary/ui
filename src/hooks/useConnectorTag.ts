import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useCallback } from 'react';
import { Schema } from 'types';
import { ConnectorTags, PublicDatabase } from 'types/supabaseSchema';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelectSingle } from './supabase-swr/';

export interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    connector_id: string;
    image_tag: string;
    endpoint_spec_schema: Schema;
    resource_spec_schema: string;
    documentation_url: string;
}

export const CONNECTOR_TAG_QUERY = `
    connectors(
        image_name
    ),
    id,
    connector_id,
    image_tag,
    endpoint_spec_schema, 
    resource_spec_schema, 
    documentation_url
`;

function useConnectorTag(connectorImage: string | null) {
    const filter = useCallback(
        (
            query: PostgrestFilterBuilder<
                PublicDatabase,
                ConnectorTags,
                ConnectorTag
            >
        ) =>
            query.or(
                `id.eq.${connectorImage},connector_id.eq.${connectorImage}`
            ),
        [connectorImage]
    );

    const connectorTagsQuery = useQuery<ConnectorTag>(
        'connector_tags',
        {
            columns: CONNECTOR_TAG_QUERY,
            filter,
        },
        [connectorImage]
    );

    const { data, error } = useSelectSingle(
        hasLength(connectorImage) ? connectorTagsQuery : null
    );

    return {
        connectorTag: data ? data.data : null,
        error,
    };
}

export default useConnectorTag;
