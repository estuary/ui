import type { UserInfoSummary } from 'src/context/UserInfoSummary/types';

import { RPCS } from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';

export const getUserInfoSummary = () => {
    return supabaseClient.rpc(RPCS.USER_INFO_SUMMARY).single<UserInfoSummary>();
};
