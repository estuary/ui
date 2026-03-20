import { insertSupabase, TABLES } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

interface DiscoverRequest {
    capture_name: string;
    draft_id: string;
    endpoint_config: any;
    update_only: boolean;
    data_plane_name?: string;
}

export const discover = (
    entityName: string,
    config: any,
    draftID: string,
    updateOnly?: boolean,
    dataPlaneName?: string
) => {
    const data: DiscoverRequest = {
        capture_name: entityName,
        endpoint_config: config,
        draft_id: draftID,
        update_only: updateOnly ?? false,
    };

    if (hasLength(dataPlaneName)) {
        data.data_plane_name = dataPlaneName;
    }

    return insertSupabase(TABLES.DISCOVERS, data);
};
