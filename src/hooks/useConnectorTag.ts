import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useCallback } from 'react';
import { useLocalStorage } from 'react-use';
import { TABLES } from 'services/supabase';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelectSingle } from './supabase-swr/';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    image_tag: string;
    endpoint_spec_schema: string;
    resource_spec_schema: string;
    documentation_url: string;
}

export const CONNECTOR_TAG_QUERY = `
    connectors(
        image_name
    ),
    id,
    image_tag,
    endpoint_spec_schema, 
    resource_spec_schema, 
    documentation_url
`;

function useConnectorTag(connectorImage: string | null) {
    const [tagSelector] = useLocalStorage(
        LocalStorageKeys.CONNECTOR_TAG_SELECTOR
    );

    const filter = useCallback(
        (query: PostgrestFilterBuilder<ConnectorTag>) =>
            query
                .eq('image_tag', tagSelector as string)
                .or(
                    `id.eq.${connectorImage},connector_id.eq.${connectorImage}`
                ),
        [connectorImage, tagSelector]
    );

    const connectorTagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
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
