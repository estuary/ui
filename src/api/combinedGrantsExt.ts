import {
    defaultTableFilter,
    SortingProps,
    supabaseClient,
} from 'services/supabase';
import { PublicEnums } from 'types/supabaseSchema';

// Used to display prefix grants in admin page
const getGrants = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from(COMBINED_GRANTS_EXT)
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
    let queryBuilder = supabaseClient
        .from(COMBINED_GRANTS_EXT)
        .select(
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
        )
        .or('user_email.neq.null,user_full_name.neq.null');

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
    let queryBuilder = supabaseClient.from('combined_grants_ext').select(`*`);

    if (adminOnly) {
        queryBuilder = queryBuilder.eq('capability', 'admin');
    }

    return queryBuilder.eq('user_id', userId);
};

// Used to find out what prefixes we can use in the data plane gateway
const getGrantsForAuthToken = () => {
    // <Grants>
    return supabaseClient.from('combined_grants_ext').select(`id, object_role`);
};

export const getAuthRoles = async (
    capability: PublicEnums['grant_capability']
) => {
    // <PublicFunctions['auth_roles']['Returns']>
    return supabaseClient
        .rpc('auth_roles', {
            min_capability: capability,
        })
        .throwOnError();
};

export { getGrantsForAuthToken, getGrants, getGrants_Users, getGrantsForUser };
