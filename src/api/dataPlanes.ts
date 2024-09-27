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

// TODO (data-planes): Keep an eye on whether this function gets used in the future.
//   Leaving in as it _likely_ will be needed.
// const getDataPlaneById = async (dataPlaneId: string) => {
//     const data = await supabaseRetry(
//         () =>
//             supabaseClient
//                 .from(TABLES.DATA_PLANES)
//                 .select('data_plane_name,id')
//                 .eq('id', dataPlaneId)
//                 .limit(1),
//         'getDataPlaneOptions'
//     ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

//     return data;
// };

export { getDataPlaneOptions };
