// {"multi_use": true, "valid_for": "10 days"}

import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import {
    RPCS,
    SortingProps,
    TABLES,
    defaultTableFilter,
    supabaseClient,
    supabaseRetry,
    updateSupabase,
} from 'services/supabase';

const createRefreshToken = async (multi_use: boolean, valid_for: string) => {
    return supabaseRetry<
        PostgrestSingleResponse<{ id: string; secret: string }>
    >(
        () =>
            supabaseClient
                .rpc(RPCS.CREATE_REFRESH_TOKEN, {
                    multi_use,
                    valid_for,
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
    user_id: string;
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
        .select('created_at,detail,id,multi_use,user_id,uses,valid_for', {
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
        .neq('valid_for', '0 days');

    return queryBuilder;
};

const updateRefreshTokenValidity = (id: string, interval: string) => {
    return updateSupabase(
        TABLES.REFRESH_TOKENS,
        { valid_for: interval },
        { id }
    );
};

export {
    createRefreshToken,
    getRefreshTokensForTable,
    updateRefreshTokenValidity,
};
