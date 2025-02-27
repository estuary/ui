import { supabaseClient } from 'context/GlobalProviders';
import {
    defaultTableFilter,
    parsePagedFetchAllResponse,
    pagedFetchAll,
    RPCS,
    SortingProps,
    TABLES,
    DEFAULT_PAGING_SIZE,
} from 'services/supabase';
import { AuthRoles, Capability, Grant_UserExt } from 'types';
import { getCountSettings } from 'utils/table-utils';

// Used to display prefix grants in admin page
const getGrants = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter(
        supabaseClient
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
                    count: getCountSettings(pagination),
                }
            )
            .neq('object_role', 'ops/dp/public/') // We rarely ever want users altering this
            .neq('subject_role', null),
        ['subject_role', 'object_role'],
        searchQuery,
        sorting,
        pagination
    );
};

// Used to display user grants in admin page
const getGrants_Users = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    const query = supabaseClient
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

    return defaultTableFilter<typeof query>(
        query,
        ['user_full_name', 'user_email', 'object_role'],
        searchQuery,
        sorting,
        pagination
    );
};

export async function getAuthRoles(
    capability: string,
    pageSize: number = DEFAULT_PAGING_SIZE
) {
    const responses = await pagedFetchAll<AuthRoles>(
        pageSize,
        'getAuthRoles',
        (start) =>
            supabaseClient
                .rpc(RPCS.AUTH_ROLES, {
                    min_capability: capability,
                })
                .range(start, start + pageSize - 1)
    );

    return parsePagedFetchAllResponse<AuthRoles>(responses);
}

const getUserInformationByPrefix = (
    objectRoles: string[],
    capability: Capability
) => {
    // Very few people are using multiple prefixes (Q4 2023) so allowing us to check 5 for now
    //  is more than enough. This also prevents people in the support role from hammering the server
    //  fetching user information for tenants they do now "own."
    const evaluatedObjectRoles =
        objectRoles.length > 5 ? objectRoles.slice(0, 4) : objectRoles;

    return supabaseClient
        .from(TABLES.COMBINED_GRANTS_EXT)
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
        .in('object_role', evaluatedObjectRoles)
        .is('subject_role', null)
        .filter('user_email', 'not.is', null)
        .returns<Grant_UserExt[]>();
};

export { getGrants, getGrants_Users, getUserInformationByPrefix };
