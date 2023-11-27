import {
    defaultTableFilter,
    RPCS,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { AuthRoles, Capability, Grants_User } from 'types';

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
    let queryBuilder = supabaseClient
        .from(TABLES.COMBINED_GRANTS_EXT)
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

export const getAuthRoles = async (capability: string) => {
    return supabaseClient
        .rpc<AuthRoles>(RPCS.AUTH_ROLES, {
            min_capability: capability,
        })
        .throwOnError();
};

const getUserInformationByPrefix = (
    objectRoles: string[],
    capability: Capability
) => {
    return supabaseClient
        .from<Grants_User>(TABLES.COMBINED_GRANTS_EXT)
        .select(
            `
            capability,
            object_role,
            subject_role,
            user_avatar_url,
            user_email,
            user_full_name,
            user_id
            `
        )
        .eq('capability', capability)
        .in('object_role', objectRoles)
        .is('subject_role', null)
        .filter('user_email', 'not.is', null);
};

export { getGrants, getGrants_Users, getUserInformationByPrefix };
