import { supabaseClient } from 'services/supabase';

export const getUserGrants = (userId: string, adminOnly?: boolean) => {
    let queryBuilder = supabaseClient.from('user_grants').select(`
        capability,
        created_at,
        detail,
        id,
        object_role,
        updated_at,
        user_id
    `);

    if (adminOnly) {
        queryBuilder = queryBuilder.eq('capability', 'admin');
    }

    return queryBuilder.eq('user_id', userId);
};
