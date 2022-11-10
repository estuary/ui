import { defaultTableFilter, supabaseClient, TABLES } from 'services/supabase';
import { Grants } from 'types';

const getGrantsForUser = (userId: string, adminOnly?: boolean) => {
    let queryBuilder = supabaseClient
        .from<Grants>(TABLES.COMBINED_GRANTS_EXT)
        .select(`*`);

    if (adminOnly) {
        queryBuilder = queryBuilder.eq('capability', 'admin');
    }

    return queryBuilder.eq('user_id', userId);
};

const getGrantsForEverything = (
    pagination: any,
    searchQuery: any,
    columnToSort: any,
    sortDirection: any
) => {
    let queryBuilder = supabaseClient.from(TABLES.COMBINED_GRANTS_EXT).select(
        `
			id, 
			subject_role, 
			object_role, 
			capability,
			user_avatar_url,
			user_full_name,
			user_email,
			updated_at
		`,
        {
            count: 'exact',
        }
    );

    queryBuilder = defaultTableFilter(
        queryBuilder,
        ['user_full_name', 'subject_role', 'object_role'],
        searchQuery,
        columnToSort,
        sortDirection,
        pagination
    );

    return queryBuilder;
};

const getGrantsForAuthToken = () => {
    return supabaseClient
        .from<Grants>(TABLES.COMBINED_GRANTS_EXT)
        .select(`id, object_role`);
};

export { getGrantsForAuthToken, getGrantsForEverything, getGrantsForUser };
