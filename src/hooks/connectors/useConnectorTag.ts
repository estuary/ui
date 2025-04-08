import type { ConnectorTag } from 'src/hooks/connectors/shared';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { CONNECTOR_TAG_QUERY } from 'src/hooks/connectors/shared';
import { TABLES } from 'src/services/supabase';
import { requiredConnectorColumnsExist } from 'src/utils/connector-utils';
import { hasLength } from 'src/utils/misc-utils';

function useConnectorTag(connectorImage: string | null) {
    const query = useMemo(() => {
        if (!hasLength(connectorImage)) {
            return null;
        }

        return requiredConnectorColumnsExist<ConnectorTag>(
            supabaseClient
                .from(TABLES.CONNECTOR_TAGS)
                .select(CONNECTOR_TAG_QUERY)
                .or(`id.eq.${connectorImage},connector_id.eq.${connectorImage}`)
                .single()
        );
    }, [connectorImage]);

    const { data, error } = useQuery(query);

    return {
        connectorTag: data ?? null,
        error,
    };
}

export default useConnectorTag;
