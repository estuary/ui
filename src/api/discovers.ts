import { insertSupabase, TABLES } from 'services/supabase';

export const discover = (
    entityName: string,
    config: any,
    connectorID: string,
    draftID: string
) => {
    return insertSupabase(TABLES.DISCOVERS, {
        capture_name: entityName,
        endpoint_config: config,
        connector_tag_id: connectorID,
        draft_id: draftID,
    });
};
