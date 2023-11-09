import { PostgrestResponse } from '@supabase/postgrest-js';
import {
    defaultTableFilter,
    RPCS,
    SortingProps,
    supabaseClient,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { AuthRoles } from 'types';

// Retrying handled in .../src/stores/Tables/Hydrator.tsx
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

// Retrying handled in .../src/stores/Tables/Hydrator.tsx
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
    return supabaseRetry<PostgrestResponse<AuthRoles>>(
        () =>
            supabaseClient
                .rpc<AuthRoles>(RPCS.AUTH_ROLES, {
                    min_capability: capability,
                })
                .throwOnError(),
        'getAuthRoles'
    );
};

export { getGrants, getGrants_Users };
