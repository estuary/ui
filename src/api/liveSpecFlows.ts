import { supabaseClient } from 'context/GlobalProviders';
import { TABLES } from 'services/supabase';
import { Entity } from 'types';

interface LiveSpecFlow {
    flow_type: Entity;
    target_id: string;
    // source_id: string;
}

export const getLiveSpecFlowBySource = (
    liveSpecId: string,
    specType: Entity
) => {
    console.log('specType', specType);
    return supabaseClient
        .from(TABLES.LIVE_SPEC_FLOWS)
        .select(`flow_type, target_id`)
        .eq('source_id', liveSpecId)
        .returns<LiveSpecFlow[]>();
};