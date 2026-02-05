import type { SortingProps } from 'src/services/supabase';
import type { ManualTypedPostgrestResponse } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

export interface AwsDnsEntry {
    dns_name: string;
    hosted_zone_id: string;
}

export interface AwsLinkEndpoint {
    dns_entries: AwsDnsEntry[];
    service_name: string;
}

export interface BaseDataPlaneQuery extends ManualTypedPostgrestResponse {
    data_plane_name: string;
    id: string;
    reactor_address: string;
    cidr_blocks: string[] | null;
    gcp_service_account_email: string | null;
    aws_iam_user_arn: string | null;
    data_plane_fqdn: string | null;
    // aws_link_endpoints: AwsLinkEndpoint | null;
}

const COLUMNS = [
    'data_plane_name',
    'data_plane_fqdn',
    'id',
    'reactor_address',
    'cidr_blocks',
    'gcp_service_account_email',
    'aws_iam_user_arn',
    // 'aws_link_endpoints', TODO uncomment after https://github.com/estuary/flow/pull/1816 is done
];

const QUERY = COLUMNS.join(',');

const getDataPlaneOptions = async (dataPlaneNames?: string[]) => {
    let queryBuilder = supabaseClient
        .from(TABLES.DATA_PLANES)
        .select(QUERY)
        .order('data_plane_name');

    if (dataPlaneNames && dataPlaneNames.length > 0) {
        queryBuilder = queryBuilder.in('data_plane_name', dataPlaneNames);
    }

    const data = await supabaseRetry(
        () => queryBuilder,
        'getDataPlaneOptions'
    ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

    return data;
};

const getDataPlanesForTable = (
    dataPlanePrefix: string,
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<BaseDataPlaneQuery>(
        supabaseClient
            .from(TABLES.DATA_PLANES)
            .select(QUERY)
            .ilike('data_plane_name', `${dataPlanePrefix}%`),
        [
            'data_plane_name',
            'data_plane_fqdn',
            'reactor_address',
            'gcp_service_account_email',
            'aws_iam_user_arn',
        ],
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
//                 .select(QUERY)
//                 .eq('id', dataPlaneId)
//                 .limit(1),
//         'getDataPlaneOptions'
//     ).then(handleSuccess<BaseDataPlaneQuery[]>, handleFailure);

//     return data;
// };

export { getDataPlanesForTable, getDataPlaneOptions };
