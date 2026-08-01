import type { SortingProps } from 'src/services/supabase';
import type { AuthRoles, Capability, Grant_UserExt } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    DEFAULT_PAGING_SIZE,
    defaultTableFilter,
    pagedFetchAll,
    parsePagedFetchAllResponse,
    RPCS,
    TABLES,
} from 'src/services/supabase';
import { getCountSettings } from 'src/utils/table-utils';

// Service accounts are backed by a synthetic auth.users row whose email always
// ends in this domain (see internal.service_accounts). They surface in
// combined_grants_ext like any human user, so the user-listing queries below
// exclude them by email suffix.
const SERVICE_ACCOUNT_EMAIL_PATTERN = '%@service_accounts.estuary.dev';

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
            updated_at,
            detail
        `,
                {
                    count: getCountSettings(pagination),
                }
            )
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
        .or('user_email.neq.null,user_full_name.neq.null')
        .not('user_email', 'like', SERVICE_ACCOUNT_EMAIL_PATTERN);

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
        .not('user_email', 'like', SERVICE_ACCOUNT_EMAIL_PATTERN)
        .returns<Grant_UserExt[]>();
};

export { getGrants, getGrants_Users, getUserInformationByPrefix };
