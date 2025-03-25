import type { UserInfoSummary } from 'context/UserInfoSummary/types';
import { supabaseClient } from 'context/GlobalProviders';
import { RPCS } from 'services/supabase';

export const getUserInfoSummary = () => {
    return supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single<UserInfoSummary>();
};
