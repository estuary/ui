import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { RPCS, supabaseClient, supabaseRetry } from 'services/supabase';

export interface EntityNode {
    id: string;
    catalog_name: string;
    spec_type: string;
}

interface DirectConnectionsResponse {
    parents: EntityNode[] | null;
    children: EntityNode[] | null;
}

export interface DirectConnections {
    parents: EntityNode[];
    children: EntityNode[];
}

const getConnectedEntities = async (entity_id: string) => {
    return supabaseRetry<PostgrestSingleResponse<DirectConnectionsResponse>>(
        () =>
            supabaseClient
                .rpc(RPCS.GET_CONNECTED_ENTITIES, {
                    entity_id,
                })
                .single(),
        'getConnectedEntities'
    );
};

export { getConnectedEntities };
