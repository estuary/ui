import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

interface Connector {
    id: string;
    title: { 'en-US': string };
    image_name: string;
}

export const CONNECTOR_QUERY = `
    id, title, image_name
`;

// A hook for fetching connectors directory from
//  their own table, without any association with
//  connector_tags. Made for the jsonForms test page (as of Q2 2023)
function useConnectors() {
    const connectorsQuery = useQuery<Connector>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_QUERY,
        },
        []
    );

    const { data, error } = useSelect(connectorsQuery);

    return {
        connectors: data?.data ?? [],
        error,
    };
}

export default useConnectors;
