import type { EntityWithCreateWorkflow } from 'src/types';
import type { LiveSpec, SpecDef } from 'src/types/schemaModels';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';

interface LiveSpecsExtRow {
    catalog_name: string;
    spec: SpecDef;
    data_plane_id: string;
    data_plane_name: string | null;
    reactor_address: string | null;
}

const LIVE_SPECS_EXT_QUERY = `
    catalog_name,
    spec,
    data_plane_id,
    data_plane_name,
    reactor_address
`;

export function useGetLiveSpec(entityType: EntityWithCreateWorkflow) {
    return useCallback(
        async (liveSpecId: string): Promise<Result<LiveSpec | null>> => {
            if (!liveSpecId) {
                return { value: null };
            }

            // liveSpecs resolver does not currently allow fetching by
            // id, so keep this as a postgresql query for now
            const { data, error } = await supabaseRetry(
                () =>
                    supabaseClient
                        .from(TABLES.LIVE_SPECS_EXT)
                        .select(LIVE_SPECS_EXT_QUERY)
                        .eq('id', liveSpecId)
                        .eq('spec_type', entityType)
                        .maybeSingle(),
                'useGetLiveSpec'
            ).then(handleSuccess<LiveSpecsExtRow>, handleFailure);

            if (error) return { error };
            if (!data) return { value: null };

            const liveSpec: LiveSpec = {
                id: liveSpecId,
                catalogName: data.catalog_name,
                spec: data.spec,
                dataPlane: {
                    id: data.data_plane_id,
                    name: data.data_plane_name,
                    reactorAddress: data.reactor_address,
                },
            };

            return { value: liveSpec };
        },
        [entityType]
    );
}
