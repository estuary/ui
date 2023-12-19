import { PostgrestError, PostgrestResponse } from '@supabase/postgrest-js';
import {
    defaultTableFilter,
    RPCS,
    SortingProps,
    supabaseClient,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { AuthRoles, Capability, Grant_UserExt } from 'types';

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

const getAuthPageSize = 3;
export type GetAuthRolesResponse =
    | { data: AuthRoles[] | null; error: null }
    | { data: null; error: PostgrestError };

export async function getAuthRoles(
    capability: string
): Promise<GetAuthRolesResponse> {
    const promises: Promise<PostgrestResponse<AuthRoles>>[] = [];
    let hasMore = true;

    while (hasMore) {
        const currentCount = promises.length;
        const start = currentCount * getAuthPageSize;

        const prom = supabaseRetry<PostgrestResponse<AuthRoles>>(
            () =>
                supabaseClient
                    .rpc<AuthRoles>(RPCS.AUTH_ROLES, {
                        min_capability: capability,
                    })
                    .range(start, start + getAuthPageSize - 1),
            'getAuthRoles'
        );
        promises.push(prom);

        // We need to know what the response is before starting another call
        //      so making this call from within the loop
        // eslint-disable-next-line no-await-in-loop
        const response = await prom;

        // Got nothing back (end of list OR error)
        //  or
        // Got less than the page size (end of list)
        if (!response.data || response.data.length < getAuthPageSize) {
            hasMore = false;
        }
    }

    const responses = await Promise.all(promises);

    const data = responses
        .filter((r) => r.data && r.data.length > 0)
        .flatMap((r) => (r.data === null ? [] : r.data));

    const error = responses
        .filter((r) => r.error)
        .flatMap((r) => (r.error === null ? [] : r.error));

    // If we got a single error then skip returning data and just
    //      return the error. This way an error page should show.
    if (error[0]) {
        return {
            error: error[0],
            data: null,
        };
    }

    return {
        error: null,
        data,
    };
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
        .from<Grant_UserExt>(TABLES.COMBINED_GRANTS_EXT)
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
        .filter('user_email', 'not.is', null);
};

export { getGrants, getGrants_Users, getUserInformationByPrefix };
