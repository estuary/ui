import { supabaseClient, TABLES } from 'services/supabase';
import { UserGrantsTenantGuard } from 'types';

export const getUserGrants = (userId: string) => {
    return supabaseClient
        .from<UserGrantsTenantGuard>(TABLES.USER_GRANTS)
        .select(`id`)
        .eq('user_id', userId);
};
