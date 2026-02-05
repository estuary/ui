import type { PostgrestSingleResponse } from '@supabase/postgrest-js';
import type { SortingProps } from 'src/services/supabase';
import type { RefreshTokenData } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    RPCS,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

const createRefreshToken = async (
    multi_use: boolean,
    valid_for: string,
    detail?: string
) => {
    return supabaseRetry<PostgrestSingleResponse<RefreshTokenData>>(
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

// Nullifying the interval for which a refresh token is valid is a means
// to invalidate the token while preserving the row in the database table.
export const INVALID_TOKEN_INTERVAL = '0 seconds';

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
    return defaultTableFilter<RefreshTokenQuery>(
        supabaseClient
            .from(TABLES.REFRESH_TOKENS)
            .select('created_at,detail,id,multi_use,uses,valid_for', {
                count: 'exact',
            })
            .eq('multi_use', true)
            .neq('valid_for', INVALID_TOKEN_INTERVAL),
        ['detail'],
        searchQuery,
        sorting,
        pagination
    );
};

const updateRefreshTokenValidity = (id: string, interval: string) => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.REFRESH_TOKENS)
                .update({ valid_for: interval })
                .match({ id }),
        'updateRefreshTokenValidity'
    ).then(handleSuccess, handleFailure);
};

export {
    createRefreshToken,
    getRefreshTokensForTable,
    updateRefreshTokenValidity,
};
