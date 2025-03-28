import type { UserInfoSummary } from 'src/context/UserInfoSummary/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import { RPCS } from 'src/services/supabase';

export const getUserInfoSummary = () => {
    return supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single<UserInfoSummary>();
};
