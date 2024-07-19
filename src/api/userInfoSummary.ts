import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { supabaseClient } from 'context/Supabase';
import { UserInfoSummary } from 'context/UserInfoSummary/types';
import { RPCS, supabaseRetry } from 'services/supabase';

export const getUserInfoSummary = async () => {
    return supabaseRetry<PostgrestSingleResponse<UserInfoSummary>>(
        () => supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single(),
        'getUserInfoSummary'
    );
};
