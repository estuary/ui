import { supabaseClient } from 'context/GlobalProviders';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'services/supabase';

export interface DataPlaneOption {
    data_plane_name: string;
    id: string;
}

const getDataPlaneOptions = async () => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DATA_PLANES)
                .select('data_plane_name,id'),
        'getDataPlaneOptions'
    ).then(handleSuccess<DataPlaneOption[]>, handleFailure);

    return data;
};

const getDataPlaneById = async (dataPlaneId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DATA_PLANES)
                .select('data_plane_name,id')
                .eq('id', dataPlaneId)
                .limit(1),
        'getDataPlaneOptions'
    ).then(handleSuccess<DataPlaneOption[]>, handleFailure);

    return data;
};

export { getDataPlaneById, getDataPlaneOptions };
