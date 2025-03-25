import { supabaseClient } from 'context/GlobalProviders';
import { deleteSupabase, TABLES } from 'services/supabase';
import type { UserGrantsTenantGuard } from 'types';

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
