import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useCallback } from 'react';
import { TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { connectorHasRequiredColumns } from 'utils/connector-utils';
import { useQuery, useSelectSingle } from '../supabase-swr/';
import { ConnectorTag, CONNECTOR_TAG_QUERY } from './shared';

function useConnectorTag(connectorImage: string | null) {
    const filter = useCallback(
        (query: PostgrestFilterBuilder<ConnectorTag>) => {
            return connectorHasRequiredColumns<ConnectorTag>(query).or(
                `id.eq.${connectorImage},connector_id.eq.${connectorImage}`
            );
        },
        [connectorImage]
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
