import type { UserGrantsTenantGuard } from 'src/types';

import { deleteSupabase, TABLES } from 'src/services/supabase';
import { supabaseClient } from 'src/services/supabaseClient';

const getUserGrants = (userId: string) => {
    return supabaseClient
        .from(TABLES.USER_GRANTS)
        .select(`id`)
        .eq('user_id', userId)
        .returns<UserGrantsTenantGuard[]>();
};

const deleteUserGrant = (id: string) => {
    return deleteSupabase(TABLES.USER_GRANTS, {
        id,
    });
};

export { deleteUserGrant, getUserGrants };
