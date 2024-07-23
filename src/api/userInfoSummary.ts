import { supabaseClient } from 'context/Supabase';
import { UserInfoSummary } from 'context/UserInfoSummary/types';
import { RPCS } from 'services/supabase';

export const getUserInfoSummary = () => {
    return supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single<UserInfoSummary>();
};
