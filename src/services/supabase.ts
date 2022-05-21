import { PostgrestError, PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, User } from '@supabase/supabase-js';
import { isEmpty } from 'lodash';

if (
    !process.env.REACT_APP_SUPABASE_URL ||
    !process.env.REACT_APP_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

const supabaseSettings = {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

export const ERROR_MESSAGES = {
    jwtExpired: 'JWT expired',
};

export const DEFAULT_FILTER = '__unknown__';

export enum TABLES {
    COMBINED_GRANTS_EXT = 'combined_grants_ext',
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DISCOVERS = 'discovers',
    DRAFT_ERRORS = 'draft_errors',
    DRAFT_SPECS = 'draft_specs',
    DRAFT_SPECS_EXT = 'draft_specs_ext',
    DRAFTS = 'drafts',
    DRAFTS_EXT = 'drafts_ext',
    LIVE_SPEC_FLOW = 'live_spec_flow',
    LIVE_SPECS = 'live_specs',
    LIVE_SPECS_EXT = 'live_specs_ext',
    PUBLICATION_SPECS = 'publication_specs',
    PUBLICATION_SPECS_EXT = 'publication_specs_ext',
    PUBLICATIONS = 'publications',
    ROLE_GRANTS = 'role_grants',
    USER_GRANTS = 'user_grants',
}

export enum RPCS {
    VIEW_LOGS = 'view_logs',
}

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

export const DEFAULT_POLLING_INTERVAL = 500;

export const defaultTableFilter = <Data>(
    query: PostgrestFilterBuilder<Data>,
    searchParam: Array<keyof Data>,
    searchQuery: string | null,
    columnToSort: keyof Data,
    sortDirection: string,
    pagination?: { from: number; to: number }
) => {
    let queryBuilder = query;

    if (searchQuery) {
        queryBuilder = queryBuilder.or(
            searchParam
                .map((param) => {
                    return `${param}.ilike.*${searchQuery}*`;
                })
                .join(',')
        );
    }

    queryBuilder = queryBuilder.order(columnToSort, {
        ascending: sortDirection === 'asc',
    });

    if (pagination) {
        queryBuilder = queryBuilder.range(pagination.from, pagination.to);
    }

    return queryBuilder;
};

export const getUserDetails = (user: User | null) => {
    let userName, email, emailVerified, avatar;

    if (user) {
        if (!isEmpty(user.user_metadata)) {
            userName = user.user_metadata.full_name;
            email = user.user_metadata.email;
            emailVerified = user.user_metadata.email_verified;
            avatar = user.user_metadata.avatar_url;
        } else {
            userName = user.email;
            email = user.email;
            emailVerified = false;
        }
    }

    return {
        userName,
        email,
        emailVerified,
        avatar,
    };
};

export interface CallSupabaseResponse {
    error?: PostgrestError;
    data: any;
}

// Used to make update calls. Mainly consumed in the src/api folder
export const callSupabase = (
    table: TABLES,
    data: any
): PromiseLike<CallSupabaseResponse> => {
    const query = supabaseClient.from(table);

    const makeCall = () => {
        return query.insert([data]).then(
            (response) => {
                if (response.error) {
                    return {
                        data: null,
                        error: response.error,
                    };
                } else {
                    return {
                        data: response.data,
                    };
                }
            },
            (error) => {
                return {
                    data: null,
                    error,
                };
            }
        );
    };

    return makeCall();
};
