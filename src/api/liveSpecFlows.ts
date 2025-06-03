import type { Entity } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import { TABLES } from 'src/services/supabase';

interface LiveSpecFlow {
    flow_type: Entity;
    target_id: string;
    // source_id: string;
}

export const getLiveSpecFlowBySource = (
    liveSpecId: string,
    specType: Entity
) => {
    return supabaseClient
        .from(TABLES.LIVE_SPEC_FLOWS)
        .select(`flow_type, target_id`)
        .eq('source_id', liveSpecId)
        .returns<LiveSpecFlow[]>();
};
