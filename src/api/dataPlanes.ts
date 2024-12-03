import { supabaseClient } from 'context/GlobalProviders';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    SortingProps,
    supabaseRetry,
    TABLES,
} from 'services/supabase';

export interface BaseDataPlaneQuery {
    data_plane_name: string;
    id: string;
    reactor_address: string;
    cidr_blocks: string[] | null;
}

const COLUMNS = ['data_plane_name', 'id', 'reactor_address', 'cidr_blocks'];

const QUERY = COLUMNS.join(',');

const getDataPlaneOptions = async () => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DATA_PLANES)
                .select(QUERY)
                .order('data_plane_name'),
        'getDataPlaneOptions'
    ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

    return data;
};

const getDataPlanesForTable = (
    catalogPrefix: string,
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<BaseDataPlaneQuery>(
        supabaseClient
            .from(TABLES.DATA_PLANES)
            .select(QUERY)
            .ilike('data_plane_name', `ops/dp/private/${catalogPrefix}%`),
        ['data_plane_name', 'reactor_address'],
        searchQuery,
        sorting,
        pagination
    );
};

// TODO (data-planes): Keep an eye on whether this function gets used in the future.
//   Leaving in as it _likely_ will be needed.
// const getDataPlaneById = async (dataPlaneId: string) => {
//     const data = await supabaseRetry(
//         () =>
//             supabaseClient
//                 .from(TABLES.DATA_PLANES)
//                 .select('data_plane_name,id,reactor_address,cidr_blocks')
//                 .eq('id', dataPlaneId)
//                 .limit(1),
//         'getDataPlaneOptions'
//     ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

//     return data;
// };

export { getDataPlanesForTable, getDataPlaneOptions };
