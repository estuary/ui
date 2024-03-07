import { useMemo } from 'react';
import { TABLES } from 'services/supabase';
import { connectorHasRequiredColumns } from 'utils/connector-utils';
import { useQuery, useSelect } from '../supabase-swr';
import { ConnectorsExist, CONNECTORS_EXIST_QUERY } from './shared';

function useHasConnectors(protocol: string | null) {
    const connectorTagsQuery = useQuery<ConnectorsExist>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTORS_EXIST_QUERY,
            filter: (query) =>
                connectorHasRequiredColumns<ConnectorsExist>(
                    query,
                    'connector_tags'
                ).eq('connector_tags.protocol', protocol as string),
        },
        [protocol]
    );

    const { data } = useSelect(protocol ? connectorTagsQuery : null);

    return useMemo(() => (data?.data ? data.data.length > 0 : false), []);
}

export default useHasConnectors;
