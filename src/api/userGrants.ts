import { supabaseClient, TABLES } from 'services/supabase';
import { UserGrants } from 'types';

export const getUserGrants = (userId: string, adminOnly?: boolean) => {
    let queryBuilder = supabaseClient
        .from<UserGrants>(TABLES.USER_GRANTS)
        .select(`*`);

    if (adminOnly) {
        queryBuilder = queryBuilder.eq('capability', 'admin');
    }

    return queryBuilder.eq('user_id', userId);
};
