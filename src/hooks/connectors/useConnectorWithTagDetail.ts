import { useMemo } from 'react';

import {
    CONNECTOR_WITH_TAG_QUERY
} from 'src/hooks/connectors/shared';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
} from 'src/services/supabase';
import { requiredConnectorColumnsExist } from 'src/utils/connector-utils';
import type {
    ConnectorWithTagDetailQuery} from 'src/hooks/connectors/shared';

const defaultResponse: ConnectorWithTagDetailQuery[] = [];

function useConnectorWithTagDetail(
    protocol: string | null,
    connectorId?: string | null
) {
    const query = useMemo(() => {
        if (!protocol) {
            return null;
        }

        if (connectorId) {
            return supabaseClient
                .from(TABLES.CONNECTORS)
                .select(CONNECTOR_WITH_TAG_QUERY)
                .eq('id', connectorId)
                .returns<ConnectorWithTagDetailQuery[]>();
        }

        return requiredConnectorColumnsExist<ConnectorWithTagDetailQuery[]>(
            supabaseClient
                .from(TABLES.CONNECTORS)
                .select(CONNECTOR_WITH_TAG_QUERY)
                .eq('connector_tags.protocol', protocol)
                .order(CONNECTOR_RECOMMENDED, { ascending: false })
                .order(CONNECTOR_NAME),
            'connector_tags'
        );
    }, [connectorId, protocol]);

    const { data, error, mutate, isValidating } = useQuery(query);

    return {
        connectorTags: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useConnectorWithTagDetail;
