import {
    defaultTableFilter,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { Grants } from 'types';

// Used to display prefix grants in admin page
const getGrants = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from(TABLES.COMBINED_GRANTS_EXT)
        .select(
            `
            id, 
            subject_role, 
            object_role, 
            capability,
            updated_at
        `,
            {
                count: 'exact',
            }
        )
        .neq('subject_role', null);

    queryBuilder = defaultTableFilter(
        queryBuilder,
        ['subject_role', 'object_role'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

// Used to display user grants in admin page
const getGrants_Users = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient.from(TABLES.COMBINED_GRANTS_EXT).select(
        `
            id, 
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
        ['user_full_name', 'user_email', 'object_role'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

// Used when getting grants for a user to know what tenant to list
const getGrantsForUser = (userId: string, adminOnly?: boolean) => {
    let queryBuilder = supabaseClient
        .from<Grants>(TABLES.COMBINED_GRANTS_EXT)
        .select(`*`);

    if (adminOnly) {
        queryBuilder = queryBuilder.eq('capability', 'admin');
    }

    return queryBuilder.eq('user_id', userId);
};

// Used to find out what prefixes we can use in the data plane gateway
const getGrantsForAuthToken = () => {
    return supabaseClient
        .from<Grants>(TABLES.COMBINED_GRANTS_EXT)
        .select(`id, object_role`);
};

export { getGrantsForAuthToken, getGrants, getGrants_Users, getGrantsForUser };
