// {"multi_use": true, "valid_for": "10 days"}

import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import {
    RPCS,
    SortingProps,
    TABLES,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseClient,
    supabaseRetry,
} from 'services/supabase';

const createRefreshToken = async (
    multi_use: boolean,
    valid_for: string,
    detail?: string
) => {
    return supabaseRetry<
        PostgrestSingleResponse<{ id: string; secret: string }>
    >(
        () =>
            supabaseClient
                .rpc(RPCS.CREATE_REFRESH_TOKEN, {
                    multi_use,
                    valid_for,
                    detail,
                })
                .single(),
        'createRefreshToken'
    );
};

export interface RefreshTokenQuery {
    created_at: string;
    detail: string;
    id: string;
    multi_use: boolean;
    uses: number;
    valid_for: string;
}

const getRefreshTokensForTable = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<RefreshTokenQuery>(TABLES.REFRESH_TOKENS)
        .select('created_at,detail,id,multi_use,uses,valid_for', {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<RefreshTokenQuery>(
        queryBuilder,
        ['detail'],
        searchQuery,
        sorting,
        pagination
    )
        .eq('multi_use', true)
        .neq('valid_for', '0 seconds');

    return queryBuilder;
};

const updateRefreshTokenValidity = (id: string, interval: string) => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.REFRESH_TOKENS)
                .update({ valid_for: interval }, { returning: 'minimal' })
                .match({ id }),
        'updateRefreshTokenValidity'
    ).then(handleSuccess, handleFailure);
};

export {
    createRefreshToken,
    getRefreshTokensForTable,
    updateRefreshTokenValidity,
};
