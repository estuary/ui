import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { supabaseClient } from 'src/context/GlobalProviders';
import { TABLES } from 'src/services/supabase';
import { CONNECTOR_QUERY } from './shared';

// A hook for fetching connectors directory from
//  their own table, without any association with
//  connector_tags. Made for the jsonForms test page (as of Q2 2023)
function useConnectors() {
    const { data, error } = useQuery(
        supabaseClient.from(TABLES.CONNECTORS).select(CONNECTOR_QUERY)
    );

    return {
        connectors: data ?? [],
        error,
    };
}

export default useConnectors;
