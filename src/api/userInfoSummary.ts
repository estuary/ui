import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { supabaseClient } from 'context/Supabase';
import { RPCS, supabaseRetry } from 'services/supabase';
import { UserInfoSummary } from 'types';

export const getUserInfoSummary = async () => {
    return supabaseRetry<PostgrestSingleResponse<UserInfoSummary>>(
        () => supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single(),
        'getUserInfoSummary'
    );
};
