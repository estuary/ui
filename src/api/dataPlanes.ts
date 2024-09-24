import { supabaseClient } from 'context/GlobalProviders';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'services/supabase';

export interface BaseDataPlaneQuery {
    data_plane_name: string;
    id: string;
}

const getDataPlaneOptions = async () => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DATA_PLANES)
                .select('data_plane_name,id')
                .order('data_plane_name'),
        'getDataPlaneOptions'
    ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

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
    ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

    return data;
};

export { getDataPlaneById, getDataPlaneOptions };
